import os
from twilio.rest import Client

MODE = os.getenv("TWILIO_MODE", "test")
ACC = os.getenv("TWILIO_ACCOUNT_SID")
TOK = os.getenv("TWILIO_AUTH_TOKEN")
FROM = os.getenv("TWILIO_FROM_NUMBER")

client = Client(ACC, TOK)

def send_sms(to: str, body: str) -> str:
    """
    Uses Twilio test creds (fake) or live creds depending on TWILIO_MODE.
    In test mode, sending to +15005550006 = success, +15005550001 = invalid, +15005550008 = queue overflow.
    """
    msg = client.messages.create(body=body, from_=FROM, to=to)
    return msg.sid  # real or fake SID depending on mode
