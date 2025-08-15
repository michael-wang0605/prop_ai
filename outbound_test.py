from twilio_utils import send_sms

if __name__ == "__main__":
    # success path in test mode
    sid = send_sms("+15005550006", "PM-AI: test outbound message")
    print("Fake/Real SID:", sid)

    # simulate invalid number error (wrap in try/except if you want)
    try:
        send_sms("+15005550001", "This should fail (invalid test number).")
    except Exception as e:
        print("Expected error:", e)
