import os, jwt
from datetime import datetime, timedelta
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from passlib.hash import bcrypt
from sqlalchemy.orm import Session
from .models import SessionLocal, User

JWT_SECRET = os.getenv("JWT_SECRET", "change-me")
security = HTTPBearer()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def hash_password(pw: str) -> str:
    return bcrypt.hash(pw)

def verify_password(pw: str, h: str) -> bool:
    return bcrypt.verify(pw, h)

def make_token(user: User) -> str:
    payload = {"sub": user.email, "role": user.role, "exp": datetime.utcnow() + timedelta(hours=12)}
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")

def require_role(*roles):
    def _dependency(credentials: HTTPAuthorizationCredentials = Depends(security)):
        try:
            payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=["HS256"])
        except Exception:
            raise HTTPException(401, "invalid token")
        if payload.get("role") not in roles:
            raise HTTPException(403, "forbidden")
        return payload
    return _dependency
