import os, time, math
from celery import Celery
from sqlalchemy.orm import Session
from api.models import SessionLocal, Campaign, Contact, Call
from api.realtime import broadcast
from voice.ari_client import originate  # helper mince

REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379/0")
app = Celery("roboworker", broker=REDIS_URL, backend=REDIS_URL)

@app.task
def run_campaign(cid: int):
    db: Session = SessionLocal()
    try:
        while True:
            camp = db.get(Campaign, cid)
            if not camp or camp.status != "RUNNING":
                break
            # Récupère un contact en attente
            ct = db.query(Contact).filter_by(campaign_id=cid, status="PENDING").first()
            if not ct:
                break
            ct.status = "DIALED"; db.commit()
            # Originate via ARI
            originate(number=ct.e164, caller_id=camp.caller_id, campaign_id=cid, contact_id=ct.id)
            broadcast_sync(cid, {"type":"placed","contact_id": ct.id})
            # Pace
            sleep_s = 60.0 / max(1, camp.pace_per_minute)
            time.sleep(sleep_s)
    finally:
        db.close()

def broadcast_sync(cid, msg):
    # Celery ne tourne pas dans l'event loop de FastAPI. Pas d'await ici.
    try:
        import asyncio
        loop = asyncio.get_event_loop()
        if loop.is_running():
            asyncio.create_task(broadcast(cid, msg))
    except RuntimeError:
        pass
