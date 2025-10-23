import os
import json
import asyncio
import websockets
from datetime import datetime
from api.models import SessionLocal, Call, Contact

ARI_URL = os.getenv("ARI_URL", "http://asterisk:8088/ari")
ARI_USER = os.getenv("ARI_USER", "robocall")
ARI_PASSWORD = os.getenv("ARI_PASSWORD", "verysecret")
APP_NAME = os.getenv("ARI_APP_NAME", "press1_app")

async def handle_event(event: dict):
    """
    Traite chaque événement reçu via le WebSocket ARI.
    """
    etype = event.get("type")
    channel = event.get("channel", {})
    chan_id = channel.get("id")

    if etype == "StasisStart":
        args = event.get("args", [])
        campaign_id = int(args[0]) if len(args) > 0 else None
        contact_id = int(args[1]) if len(args) > 1 else None
        db = SessionLocal()
        try:
            call = Call(
                campaign_id=campaign_id,
                contact_id=contact_id,
                asterisk_channel=chan_id,
                started_at=datetime.utcnow(),
                disposition="ANSWERED",
            )
            db.add(call)
            db.commit()
        finally:
            db.close()

    elif etype == "ChannelDtmfReceived":
        digit = event.get("digit")
        if digit == "1":
            db = SessionLocal()
            try:
                call = db.query(Call).filter_by(asterisk_channel=chan_id).first()
                if call:
                    call.dtmf = "1"
                    if call.contact_id:
                        c = db.query(Contact).get(call.contact_id)
                        if c:
                            c.status = "CONFIRMED"
                    db.commit()
            finally:
                db.close()

    elif etype == "ChannelDestroyed":
        db = SessionLocal()
        try:
            call = db.query(Call).filter_by(asterisk_channel=chan_id).first()
            if call:
                call.ended_at = datetime.utcnow()
                db.commit()
        finally:
            db.close()


async def ari_listener():
    """
    Se connecte au WebSocket ARI et écoute tous les événements.
    """
    ws_url = (
        f"ws://asterisk:8088/ari/events?"
        f"api_key={ARI_USER}:{ARI_PASSWORD}&app={APP_NAME}"
    )
    while True:
        try:
            async with websockets.connect(ws_url) as ws:
                print(f"[*] Connected to ARI WebSocket at {ws_url}")
                async for msg in ws:
                    event = json.loads(msg)
                    await handle_event(event)
        except Exception as e:
            print(f"[!] ARI WebSocket error: {e}")
            await asyncio.sleep(5)  # Reconnexion après erreur


if __name__ == "__main__":
    print(f"[*] Starting ARI listener for app '{APP_NAME}'")
    asyncio.run(ari_listener())
