import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import analyses, auth, sequences
from app.core.config import settings
from app.db.base import Base
from app.db.session import engine

logger = logging.getLogger(__name__)

app = FastAPI(title="BaseCall AI", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(sequences.router)
app.include_router(analyses.router)


@app.on_event("startup")
def on_startup() -> None:
    Base.metadata.create_all(bind=engine)
    if "change-me" in settings.jwt_secret_key.lower() or len(settings.jwt_secret_key) < 20:
        logger.warning(
            "JWT_SECRET_KEY looks like a placeholder value (default, copied from "
            ".env.example, or too short) -- anyone can forge valid login tokens. "
            "Set a real, random JWT_SECRET_KEY environment variable before this "
            "is exposed publicly."
        )


@app.get("/api/health")
def health() -> dict:
    return {"status": "ok"}
