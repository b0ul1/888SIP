import os
import ari
from datetime import datetime
from api.models import SessionLocal, Call, Contact

# Configuration ARI
ARI_URL = os.getenv("ARI_URL", "http://asterisk:8088")
ARI_USER = os.getenv("ARI_USER", "robocall")
ARI_PASSWORD = os.getenv("ARI_PASSWORD", "verysecret")
APP_NAME = os.getenv("ARI_APP_NAME", "press1_app")

cli = ari.connect(ARI_URL, ARI_USER, ARI_PASSWORD)


@cli.on_event('StasisStart')
def on_start(event, channel):
    """Handler appelé quand un appel entre dans l'application ARI."""
    db = SessionLocal()
    try:
        # Récupère les variables passées par le dialplan
        args = event.get('args', [])
        campaign_id = int(args[0]) if len(args) > 0 else None
        contact_id = int(args[1]) if len(args) > 1 else None

        # Création de l'entrée Call
        call = Call(
            campaign_id=campaign_id,
            contact_id=contact_id,
            asterisk_channel=channel.id,
            started_at=datetime.utcnow(),
            disposition="ANSWERED",
        )
        db.add(call)
        db.commit()
        db.refresh(call)

        # Réponse et lecture du prompt
        channel.answer()
        channel.play(media='sound:custom/intro')

        # Attache les callbacks pour les événements suivants
        channel.on_event('ChannelDtmfReceived', lambda e, ch: on_dtmf(e, ch, call.id))
        channel.on_event('ChannelDestroyed', lambda e, ch: on_end(e, ch, call.id))

    except Exception as e:
        print(f"[ERROR] StasisStart: {e}")
        db.rollback()
    finally:
        db.close()


def on_dtmf(event, channel, call_id):
    """Handler des DTMF reçus (touche 1 = confirmation)."""
    db = SessionLocal()
    try:
        digit = event.get('digit')
        if digit == '1':
            call = db.get(Call, call_id)
            if call:
                call.dtmf = '1'
                if call.contact_id:
                    contact = db.get(Contact, call.contact_id)
                    if contact:
                        contact.status = "CONFIRMED"
                db.commit()

            channel.play(media='sound:custom/thanks')
            channel.hangup()

    except Exception as e:
        print(f"[ERROR] on_dtmf: {e}")
        db.rollback()
    finally:
        db.close()


def on_end(event, channel, call_id):
    """Handler appelé à la fin de l'appel."""
    db = SessionLocal()
    try:
        call = db.get(Call, call_id)
        if call:
            call.ended_at = datetime.utcnow()
            db.commit()
    except Exception as e:
        print(f"[ERROR] on_end: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    print(f"[*] Connecting to ARI at {ARI_URL} as {ARI_USER}, app={APP_NAME}")
    cli.run(apps=[APP_NAME])
