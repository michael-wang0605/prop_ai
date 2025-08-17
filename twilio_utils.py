# twilio_utils.py
import os
from twilio.rest import Client

ACC = os.getenv("TWILIO_ACCOUNT_SID")
TOK = os.getenv("TWILIO_AUTH_TOKEN")
FROM = os.getenv("TWILIO_FROM_NUMBER")

client = Client(ACC, TOK)

def send_sms(to: str, body: str) -> str:
    msg = client.messages.create(body=body, from_=FROM, to=to)
    return msg.sid
