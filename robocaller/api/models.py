import os
from datetime import datetime
from sqlalchemy import (create_engine, Column, Integer, String, Text, JSON,
                        ForeignKey, TIMESTAMP, Enum, CheckConstraint)
from sqlalchemy.orm import declarative_base, relationship, sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./dev.db")
engine = create_engine(DATABASE_URL, echo=False, future=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    email = Column(Text, unique=True, nullable=False)
    password_hash = Column(Text, nullable=False)
    role = Column(String(10), nullable=False)  # ADMIN or CALLER
    __table_args__ = (CheckConstraint("role in ('ADMIN','CALLER')"),)

class Campaign(Base):
    __tablename__ = "campaigns"
    id = Column(Integer, primary_key=True)
    name = Column(Text, nullable=False)
    caller_id = Column(Text, nullable=False)
    concurrent_limit = Column(Integer, nullable=False)
    pace_per_minute = Column(Integer, nullable=False)
    status = Column(String(10), nullable=False, default="DRAFT")
    __table_args__ = (CheckConstraint("status in ('DRAFT','RUNNING','PAUSED','STOPPED')"),)
    contacts = relationship("Contact", backref="campaign", cascade="all,delete")

class Contact(Base):
    __tablename__ = "contacts"
    id = Column(Integer, primary_key=True)
    campaign_id = Column(Integer, ForeignKey("campaigns.id"))
    e164 = Column(Text, nullable=False)
    meta = Column(JSON, default={})
    status = Column(String(12), default="PENDING")
    __table_args__ = (CheckConstraint("status in ('PENDING','DIALED','CONFIRMED','FAILED','DNC')"),)

class Call(Base):
    __tablename__ = "calls"
    id = Column(Integer, primary_key=True)
    campaign_id = Column(Integer, ForeignKey("campaigns.id"))
    contact_id = Column(Integer, ForeignKey("contacts.id"))
    asterisk_channel = Column(Text)
    started_at = Column(TIMESTAMP, default=datetime.utcnow)
    ended_at = Column(TIMESTAMP)
    disposition = Column(Text)
    dtmf = Column(Text)

class Event(Base):
    __tablename__ = "events"
    id = Column(Integer, primary_key=True)
    call_id = Column(Integer, ForeignKey("calls.id"))
    ts = Column(TIMESTAMP, default=datetime.utcnow)
    type = Column(Text)
    payload = Column(JSON, default={})

def init_db():
    Base.metadata.create_all(bind=engine)
