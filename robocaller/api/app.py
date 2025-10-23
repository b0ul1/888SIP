import os, asyncio
from fastapi import FastAPI, Depends, HTTPException
from pydantic import BaseModel
from typing import List
from .models import init_db, SessionLocal, Campaign, Contact, Call
from .auth import get_db, hash_password, verify_password, make_token, require_role
from sqlalchemy.orm import Session
from .realtime import router as ws_router, broadcast

app = FastAPI(title="RoboCaller API", version="1.0.0")
app.include_router(ws_router)

@app.on_event("startup")
def _startup():
    init_db()

# ===== Auth minimal =====
class Creds(BaseModel):
    email: str
    password: str

@app.post("/auth/seed-admin")
def seed_admin(creds: Creds, db: Session = Depends(get_db)):
    if db.query(Campaign).first() is None:
        pass  # no-op, just to ensure DB touched
    from .models import User
    u = db.query(User).filter_by(email=creds.email).first()
    if u:
        raise HTTPException(400, "exists")
    u = User(email=creds.email, password_hash=hash_password(creds.password), role="ADMIN")
    db.add(u); db.commit()
    return {"ok": True}

@app.post("/auth/login")
def login(creds: Creds, db: Session = Depends(get_db)):
    from .models import User
    u = db.query(User).filter_by(email=creds.email).first()
    if not u or not verify_password(creds.password, u.password_hash):
        raise HTTPException(401, "bad credentials")
    return {"token": make_token(u), "role": u.role}

# ===== Campaigns =====
class CampaignIn(BaseModel):
    name: str
    caller_id: str
    concurrent_limit: int
    pace_per_minute: int

@app.post("/campaigns", dependencies=[Depends(require_role("ADMIN"))])
def create_campaign(body: CampaignIn, db: Session = Depends(get_db)):
    c = Campaign(**body.model_dump(), status="DRAFT")
    db.add(c); db.commit(); db.refresh(c)
    return {"id": c.id, **body.model_dump()}

@app.get("/campaigns", dependencies=[Depends(require_role("ADMIN","CALLER"))])
def list_campaigns(db: Session = Depends(get_db)):
    rows = db.query(Campaign).all()
    return [{"id": r.id, "name": r.name, "status": r.status} for r in rows]

@app.post("/campaigns/{cid}/start", dependencies=[Depends(require_role("ADMIN"))])
def start_campaign(cid: int, db: Session = Depends(get_db)):
    c = db.get(Campaign, cid)
    if not c: raise HTTPException(404)
    c.status = "RUNNING"; db.commit()
    # le worker lira cet état; on émet un event
    asyncio.create_task(broadcast(cid, {"type":"status","status":"RUNNING"}))
    return {"ok": True}

@app.post("/campaigns/{cid}/pause", dependencies=[Depends(require_role("ADMIN"))])
def pause_campaign(cid: int, db: Session = Depends(get_db)):
    c = db.get(Campaign, cid)
    if not c: raise HTTPException(404)
    c.status = "PAUSED"; db.commit()
    asyncio.create_task(broadcast(cid, {"type":"status","status":"PAUSED"}))
    return {"ok": True}

@app.get("/campaigns/{cid}/stats", dependencies=[Depends(require_role("ADMIN","CALLER"))])
def stats(cid: int, db: Session = Depends(get_db)):
    placed = db.query(Call).filter(Call.campaign_id==cid).count()
    answered = db.query(Call).filter(Call.campaign_id==cid, Call.disposition=="ANSWERED").count()
    confirmed = db.query(Call).filter(Call.campaign_id==cid, Call.dtmf=="1").count()
    return {"placed": placed, "answered": answered, "confirmed": confirmed}

# ===== Contacts =====
class ContactIn(BaseModel):
    e164: str

@app.post("/campaigns/{cid}/contacts", dependencies=[Depends(require_role("ADMIN"))])
def add_contact(cid: int, body: ContactIn, db: Session = Depends(get_db)):
    from .models import Contact
    c = db.get(Campaign, cid)
    if not c: raise HTTPException(404)
    ct = Contact(campaign_id=cid, e164=body.e164, status="PENDING")
    db.add(ct); db.commit(); db.refresh(ct)
    return {"id": ct.id, "e164": ct.e164}

# ===== Manual originate endpoint (démo) =====
class DialIn(BaseModel):
    contact_id: int

@app.post("/campaigns/{cid}/dial", dependencies=[Depends(require_role("ADMIN"))])
def dial(cid: int, body: DialIn):
    # Le worker réel gère l'origination. Ici on push un signal simple.
    asyncio.create_task(broadcast(cid, {"type":"dial","contact_id": body.contact_id}))
    return {"ok": True}
