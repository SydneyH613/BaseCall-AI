from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "postgresql+psycopg://basecall:basecall@localhost:5432/basecall"
    jwt_secret_key: str = "change-me"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60
    anthropic_api_key: str = ""
    cors_origins: str = "http://localhost:5173"

    @field_validator("database_url")
    @classmethod
    def normalize_database_url(cls, v: str) -> str:
        """Managed Postgres providers (Render, Heroku, etc.) hand out a bare
        `postgres://` or `postgresql://` URL with no driver specified. Left
        as-is, SQLAlchemy defaults that bare scheme to the legacy psycopg2
        dialect -- but this app is built on psycopg (v3), so that driver was
        never installed and the app crashes on startup with
        `ModuleNotFoundError: No module named 'psycopg2'`. Normalize here so
        the URL always resolves to the driver that's actually installed,
        regardless of what raw connection string the host provides.
        """
        if v.startswith("postgres://"):
            v = "postgresql://" + v[len("postgres://") :]
        if v.startswith("postgresql://"):
            v = "postgresql+psycopg://" + v[len("postgresql://") :]
        return v

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


settings = Settings()
