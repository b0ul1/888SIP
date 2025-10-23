import os, ari
from api.models import SessionLocal, Call, Contact
from datetime import datetime

ARI_URL = os.getenv("ARI_URL", "http://asterisk:8088")
ARI_USER = os.getenv("ARI_USER", "robocall")
ARI_PASSWORD = os.getenv("ARI_PASSWORD", "verysecret")
APP_NAME = os.getenv("ARI_APP_NAME", "press1_app")

cli = ari.connect(ARI_URL, ARI_USER, ARI_PASSWORD)

@cli.on_event('StasisStart')
def on_start(event, channel):
    db = SessionLocal()
    try:
        vars = channel.getChannelVar(variable='CONTACT_ID') # may be None
        contact_id = event['args'][1] if event.get('args') else None
        # selon version ARI, utilisez channel.getChannelVar ou event['channel']['dialplan']
    except Exception:
        contact_id = None
    # call row
    call = Call(
        campaign_id=int(event['args'][0]) if event.get('args') else None,
        contact_id=int(contact_id) if contact_id else None,
        asterisk_channel=channel.id,
        started_at=datetime.utcnow(),
        disposition="ANSWERED"
    )
    db.add(call); db.commit(); db.refresh(call)
    # Lecture prompt
    channel.answer()
    channel.play(media='sound:custom/intro')
    channel.on_event('ChannelDtmfReceived', lambda e, ch: on_dtmf(e, ch, call.id, db))
    channel.on_event('ChannelDestroyed', lambda e, ch: on_end(e, ch, call.id, db))

def on_dtmf(event, channel, call_id, db):
    digit = event.get('digit')
    if digit == '1':
        call = db.get(Call, call_id)
        call.dtmf = '1'
        if call.contact_id:
            ct = db.get(Contact, call.contact_id)
            if ct:
                ct.status = "CONFIRMED"
        db.commit()
        channel.play(media='sound:custom/thanks')
        channel.hangup()

def on_end(event, channel, call_id, db):
    call = db.get(Call, call_id)
    if call:
        call.ended_at = datetime.utcnow()
        db.commit()

if __name__ == "__main__":
    cli.run(apps=[APP_NAME])
