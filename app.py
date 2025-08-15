import os
from fastapi import FastAPI, Request
from fastapi.responses import PlainTextResponse
from twilio_utils import send_sms

app = FastAPI()

def classify(body: str) -> str:
    text = body.lower()
    if any(k in text for k in ["leak", "ac", "heat", "sink", "toilet", "maintenance", "fix"]):
        return "MAINTENANCE"
    if any(k in text for k in ["rent", "pay", "due"]):
        return "RENT"
    return "GENERAL"

@app.post("/twilio/inbound")
async def inbound_sms(request: Request):
    # Twilio posts x-www-form-urlencoded. For local tests we mimic this exactly.
    form = await request.form()
    from_ = form.get("From")
    to = form.get("To")
    body = (form.get("Body") or "").strip()

    intent = classify(body)
    # TODO: save to DB: from_, to, body, intent, timestamps, thread_id, etc.

    # Example auto-reply policy (you can swap in your LLM here)
    if intent == "MAINTENANCE":
        reply = "Got it. Maintenance ticket opened. Tech will follow up shortly."
    elif intent == "RENT":
        reply = "Rent help noted. Reply if you need a payment plan or receipt."
    else:
        reply = "Thanks! We received your message."

    # Option A: reply instantly via TwiML (Twilio will deliver the XML reply)
    # Option B: send a separate outbound message via REST (works in test/live)
    # Using B here to exercise outbound code path:
    try:
        sid = send_sms(from_, reply)  # echo back to sender
        _ = sid  # log if desired
    except Exception as e:
        # log error
        pass

    # Twilio expects valid TwiML or at least a 200. Keep a simple TwiML:
    twiml = f"""<?xml version="1.0" encoding="UTF-8"?>
<Response><Message>Thanks! (ref:{intent})</Message></Response>"""
    return PlainTextResponse(twiml, media_type="application/xml")

@app.post("/twilio/status")
async def delivery_status(request: Request):
    form = await request.form()
    # form includes MessageSid, MessageStatus, ErrorCode, etc.
    # TODO: persist status against your message table
    return PlainTextResponse("OK")
