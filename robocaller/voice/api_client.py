import os, ari

ARI_URL = os.getenv("ARI_URL", "http://asterisk:8088")
ARI_USER = os.getenv("ARI_USER", "robocall")
ARI_PASSWORD = os.getenv("ARI_PASSWORD", "verysecret")
ARI_APP_NAME = os.getenv("ARI_APP_NAME", "press1_app")

_client = None
def client():
    global _client
    if _client is None:
        _client = ari.connect(ARI_URL, ARI_USER, ARI_PASSWORD)
    return _client

def originate(number: str, caller_id: str, campaign_id: int, contact_id: int):
    cli = client()
    return cli.channels.originate(
        endpoint=f"PJSIP/{number}",
        app=ARI_APP_NAME,
        callerId=caller_id,
        variables={
            "CAMPAIGN_ID": str(campaign_id),
            "CONTACT_ID": str(contact_id)
        }
    )
