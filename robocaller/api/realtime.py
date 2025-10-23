from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from .auth import verify_token
import asyncio
import aioredis

router = APIRouter()

class ConnectionManager:
    def __init__(self):
        self.active_connections: dict[str, set[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, cid: str, role: str):
        await websocket.accept()
        if cid not in self.active_connections:
            self.active_connections[cid] = set()
        self.active_connections[cid].add(websocket)

    def disconnect(self, websocket: WebSocket):
        for cid in list(self.active_connections.keys()):
            if websocket in self.active_connections[cid]:
                self.active_connections[cid].remove(websocket)
                if not self.active_connections[cid]:
                    del self.active_connections[cid]

    async def broadcast(self, message: str):
        for group in self.active_connections.values():
            for ws in group:
                await ws.send_text(message)


manager = ConnectionManager()


@router.websocket("/ws/campaigns/{cid}")
async def websocket_endpoint(websocket: WebSocket, cid: str, token: str = Query(...)):
    user = verify_token(token)
    if not user:
        await websocket.close(code=1008)
        return
    await manager.connect(websocket, cid, user["role"])
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)


async def redis_listener():
    redis = await aioredis.from_url("redis://redis:6379")
    pubsub = redis.pubsub()
    await pubsub.subscribe("broadcasts")
    async for message in pubsub.listen():
        if message["type"] == "message":
            await manager.broadcast(message["data"])
