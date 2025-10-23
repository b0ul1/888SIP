import os
import ari

ARI_URL = os.getenv("ARI_URL", "http://asterisk:8088")
ARI_USER = os.getenv("ARI_USER", "robocall")
ARI_PASSWORD = os.getenv("ARI_PASSWORD", "verysecret")
ARI_APP_NAME = os.getenv("ARI_APP_NAME", "press1_app")

_client = None

def get_client():
    global _client
    if _client is None:
        _client = ari.connect(ARI_URL, ARI_USER, ARI_PASSWORD)
    return _client

def originate(number: str, caller_id: str, campaign_id: int, contact_id: int):
    cli = get_client()
    return cli.channels.originate(
        endpoint=f"PJSIP/provider/{number}",
        app=ARI_APP_NAME,
        callerId=caller_id,
        variables={
            "CAMPAIGN_ID": str(campaign_id),
            "CONTACT_ID": str(contact_id)
        }
    )

