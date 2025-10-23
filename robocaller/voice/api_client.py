import os
import requests

ARI_URL = os.getenv("ARI_URL", "http://asterisk:8088/ari")
ARI_USER = os.getenv("ARI_USER", "robocall")
ARI_PASSWORD = os.getenv("ARI_PASSWORD", "verysecret")
ARI_APP_NAME = os.getenv("ARI_APP_NAME", "press1_app")


def originate(number: str, caller_id: str, campaign_id: int, contact_id: int):
    """
    Lance un appel via l'API REST ARI d'Asterisk.
    """
    url = f"{ARI_URL}/channels"
    params = {
        "endpoint": f"PJSIP/provider/{number}",
        "app": ARI_APP_NAME,
        "callerId": caller_id,
        "variables": {
            "CAMPAIGN_ID": str(campaign_id),
            "CONTACT_ID": str(contact_id),
        },
    }
    r = requests.post(url, auth=(ARI_USER, ARI_PASSWORD), params=params)
    if r.status_code not in (200, 202):
        raise RuntimeError(f"ARI originate failed: {r.status_code} {r.text}")
    return r.json()


def hangup(channel_id: str):
    """
    Termine un canal actif.
    """
    url = f"{ARI_URL}/channels/{channel_id}"
    r = requests.delete(url, auth=(ARI_USER, ARI_PASSWORD))
    if r.status_code != 204:
        raise RuntimeError(f"ARI hangup failed: {r.status_code} {r.text}")


def play_sound(channel_id: str, sound: str):
    """
    Joue un son sur un canal actif (ex : sound:custom/intro).
    """
    url = f"{ARI_URL}/channels/{channel_id}/play"
    params = {"media": f"sound:{sound}"}
    r = requests.post(url, auth=(ARI_USER, ARI_PASSWORD), params=params)
    if r.status_code not in (200, 202):
        raise RuntimeError(f"ARI play failed: {r.status_code} {r.text}")
    return r.json()
