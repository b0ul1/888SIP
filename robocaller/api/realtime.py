import asyncio
from typing import Dict, Set
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

router = APIRouter()
clients_by_campaign: Dict[int, Set[WebSocket]] = {}

@router.websocket("/ws/campaigns/{cid}")
async def ws_campaign(ws: WebSocket, cid: int):
    await ws.accept()
    clients_by_campaign.setdefault(cid, set()).add(ws)
    try:
        while True:
            await asyncio.sleep(30)
    except WebSocketDisconnect:
        pass
    finally:
        clients_by_campaign[cid].discard(ws)

async def broadcast(cid: int, message: dict):
    dead = []
    for ws in list(clients_by_campaign.get(cid, set())):
        try:
            await ws.send_json(message)
        except Exception:
            dead.append(ws)
    for ws in dead:
        clients_by_campaign[cid].discard(ws)
