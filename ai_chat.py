# ai_chat.py
import os, json, httpx
from datetime import datetime
from typing import Optional, List, Dict, Any
from fastapi import Response
from fastapi import FastAPI, HTTPException, Body, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, HttpUrl
from dotenv import load_dotenv

from sqlalchemy import (
    create_engine, Column, String, Integer, DateTime, Text, Enum, Float, JSON
)
from sqlalchemy.orm import sessionmaker, declarative_base, Session

# ------------------ Env / Config ------------------
load_dotenv()

API_KEY = os.getenv("LLM_API_KEY")
if not API_KEY:
    raise RuntimeError("LLM_API_KEY not set.")

# Text default model (no uploads)
TEXT_MODEL   = os.getenv("LLM_MODEL", "llama-3.1-8b-instant")

# Vision model (when an image OR document is provided)
VISION_MODEL = os.getenv("LLM_VISION_MODEL", "meta-llama/llama-4-maverick-17b-128e-instruct")

# Groq OpenAI-compatible endpoint
GROQ_URL = os.getenv("LLM_URL", "https://api.groq.com/openai/v1/chat/completions")

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./propai.db")

# ------------------ DB Setup ------------------
Base = declarative_base()
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)

def get_db() -> Session:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class Contact(Base):
    __tablename__ = "contacts"
    phone = Column(String, primary_key=True, index=True)
    tenant_name = Column(String, nullable=False)
    unit = Column(String, nullable=False)
    address = Column(String, nullable=False)
    hotline = Column(String, nullable=True)
    portal_url = Column(String, nullable=True)
    property_name = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)

class Message(Base):
    __tablename__ = "messages"
    id = Column(Integer, primary_key=True, autoincrement=True)
    phone = Column(String, index=True, nullable=False)
    direction = Column(Enum("inbound", "outbound", name="direction"), nullable=False)
    to = Column(String, nullable=True)
    from_ = Column(String, nullable=True)
    body = Column(Text, nullable=True)
    media_urls = Column(JSON, nullable=False, default=list)
    status = Column(String, default="received")
    created_at = Column(DateTime, default=datetime.utcnow)

    # Optional AI annotations
    ai_reply = Column(Text, nullable=True)
    category = Column(String, nullable=True)
    priority = Column(String, nullable=True)
    action = Column(String, nullable=True)
    confidence = Column(Float, nullable=True)
    entities = Column(JSON, nullable=True)

Base.metadata.create_all(bind=engine)

# ------------------ System Prompt ------------------
# (No image instructions by default.)
PM_SYSTEM = (
    "You are PropAI, a helpful personal assistant for property managers.\n"
    "Use the provided context about the property and tenant to answer accurately.\n"
    "Suggest maintenance tips, rent policies, or next actions based on standard practices.\n"
    "Keep responses concise, professional, and helpful.\n"
)

# ------------------ Schemas ------------------
class Context(BaseModel):
    tenant_name: str
    unit: str
    address: str
    hotline: Optional[str] = None
    portal_url: Optional[str] = None
    property_name: Optional[str] = None

class PmChatRequest(BaseModel):
    message: str
    context: Context
    image_url: Optional[str] = None      # optional; triggers vision if present
    document_url: Optional[str] = None   # optional; triggers vision if present

class PmChatResponse(BaseModel):
    reply: str

class StoredMessage(BaseModel):
    id: int
    phone: str
    direction: str
    to: Optional[str] = None
    from_: Optional[str] = None
    body: Optional[str] = None
    media_urls: List[str] = []
    status: str
    created_at: datetime
    ai_reply: Optional[str] = None
    category: Optional[str] = None
    priority: Optional[str] = None
    action: Optional[str] = None
    confidence: Optional[float] = None
    entities: Optional[Dict[str, Any]] = None

    class Config:
        orm_mode = True

class ThreadSummary(BaseModel):
    id: str
    participant: str
    last_message: Optional[str] = None
    last_status: Optional[str] = None
    count: int

# ------------------ App ------------------
app = FastAPI(title="PropAI PM Chat (single-file)")

FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN", "")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o for o in [FRONTEND_ORIGIN, "http://localhost:3000", "http://127.0.0.1:3000"] if o],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.options("/{rest_of_path:path}")
def preflight_passthrough(rest_of_path: str):
    return Response(status_code=204)

# ------------------ LLM Helper ------------------
async def call_groq(messages: List[Dict[str, Any]], model: str) -> str:
    payload = {
        "model": model,
        "messages": messages,
        "temperature": 0.2,
    }
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json",
    }
    async with httpx.AsyncClient(timeout=60) as client:
        r = await client.post(GROQ_URL, headers=headers, json=payload)
        try:
            r.raise_for_status()
        except httpx.HTTPStatusError as e:
            raise HTTPException(status_code=r.status_code, detail=f"LLM error: {r.text}") from e
        data = r.json()
        return data.get("choices", [{}])[0].get("message", {}).get("content", "")

# ------------------ Routes ------------------
@app.get("/")
def health():
    return {
        "ok": True,
        "text_model": TEXT_MODEL,
        "vision_model": VISION_MODEL,
        "db": DATABASE_URL,
    }

@app.post("/pm_chat", response_model=PmChatResponse)
async def pm_chat(req: PmChatRequest = Body(...)):
    has_text = bool((req.message or "").strip())
    has_upload = bool(req.image_url or req.document_url)
    if not has_text and not has_upload:
        raise HTTPException(400, "Message or image_url/document_url required.")

    # Choose model: text by default; vision only if file provided
    model = VISION_MODEL if has_upload else TEXT_MODEL

    # Build system + user content
    system_with_context = PM_SYSTEM + "\n\nContext JSON:\n" + json.dumps(req.context.dict(), ensure_ascii=False)

    # If uploads provided, use multimodal content format; else plain text
    if has_upload:
        user_parts: List[Dict[str, Any]] = [{"type": "text", "text": req.message}] if has_text else []
        if req.image_url:
            user_parts.append({"type": "image_url", "image_url": {"url": req.image_url}})
        if req.document_url:
            # Treat documents as an external resource; many vision-capable chat endpoints accept them via 'image_url' style or text ref.
            # If the API supports a dedicated document type, adapt here; otherwise include as text reference.
            user_parts.append({"type": "text", "text": f"Document URL: {req.document_url}"})
        user_content: Any = user_parts
    else:
        user_content = req.message

    messages = [
        {"role": "system", "content": system_with_context},
        {"role": "user",   "content": user_content},
    ]

    reply = (await call_groq(messages, model=model) or "").strip()
    if not reply:
        reply = "Sorry—I'm not sure how to help with that yet."
    return PmChatResponse(reply=reply)

# ---------- Contacts (persist context) ----------
@app.post("/contacts/upsert")
def upsert_contact(phone: str, context: Context, db: Session = Depends(get_db)):
    phone = phone.strip()
    if not phone:
        raise HTTPException(400, "phone required")

    row = db.get(Contact, phone)
    now = datetime.utcnow()
    if row:
        row.tenant_name = context.tenant_name
        row.unit = context.unit
        row.address = context.address
        row.hotline = context.hotline
        row.portal_url = context.portal_url
        row.property_name = context.property_name
        row.updated_at = now
    else:
        row = Contact(
            phone=phone,
            tenant_name=context.tenant_name,
            unit=context.unit,
            address=context.address,
            hotline=context.hotline,
            portal_url=context.portal_url,
            property_name=context.property_name,
            created_at=now,
            updated_at=now,
        )
        db.add(row)
    db.commit()
    return {"ok": True}

@app.get("/contacts/{phone}", response_model=Context)
def get_contact(phone: str, db: Session = Depends(get_db)):
    row = db.get(Contact, phone)
    if not row:
        raise HTTPException(404, "Not found")
    return Context(
        tenant_name=row.tenant_name,
        unit=row.unit,
        address=row.address,
        hotline=row.hotline,
        portal_url=row.portal_url,
        property_name=row.property_name,
    )

# ---------- Minimal Threads API (for your UI) ----------
@app.get("/threads", response_model=List[ThreadSummary])
def list_threads(db: Session = Depends(get_db)):
    sums: Dict[str, ThreadSummary] = {}
    q = db.query(Message).order_by(Message.created_at.asc()).all()
    for m in q:
        if m.phone not in sums:
            sums[m.phone] = ThreadSummary(
                id=m.phone, participant=m.phone, last_message=None, last_status=None, count=0
            )
        t = sums[m.phone]
        t.count += 1
        last_text = m.body or m.ai_reply
        if last_text:
            t.last_message = last_text
        t.last_status = m.status
    return sorted(sums.values(), key=lambda t: (t.count, t.id), reverse=True)

@app.get("/threads/{phone}", response_model=List[StoredMessage])
def get_thread(phone: str, db: Session = Depends(get_db)):
    rows = (
        db.query(Message)
        .filter(Message.phone == phone)
        .order_by(Message.created_at.asc())
        .all()
    )
    return rows

# ---------- Lightweight seeding endpoints (optional) ----------
class CreateMessage(BaseModel):
    phone: str
    direction: str  # "inbound" | "outbound"
    body: Optional[str] = None
    media_urls: Optional[List[HttpUrl]] = None
    status: Optional[str] = "received"
    to: Optional[str] = None
    from_: Optional[str] = None

@app.post("/messages", response_model=StoredMessage)
def create_message(msg: CreateMessage, db: Session = Depends(get_db)):
    if msg.direction not in ("inbound", "outbound"):
        raise HTTPException(400, "direction must be inbound|outbound")
    row = Message(
        phone=msg.phone,
        direction=msg.direction,
        to=msg.to,
        from_=msg.from_,
        body=msg.body,
        media_urls=[str(u) for u in (msg.media_urls or [])],
        status=msg.status or "received",
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return row
