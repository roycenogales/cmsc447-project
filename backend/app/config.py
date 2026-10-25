from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict
from sqlalchemy import URL

# backend/.env, so settings load the same no matter which directory you run from.
ENV_FILE = Path(__file__).resolve().parents[1] / ".env"


class Settings(BaseSettings):
    """App settings, read from environment variables (or a local .env file)."""

    model_config = SettingsConfigDict(env_file=ENV_FILE, extra="ignore")

    postgres_user: str
    postgres_password: str
    postgres_db: str
    postgres_host: str = "localhost"
    postgres_port: int = 5432
    cors_origins: list[str] = ["http://localhost:5173", "http://127.0.0.1:5173"]
    # Optional regex for extra allowed origins, e.g. the Vite dev server on a LAN IP.
    cors_origin_regex: str | None = None

    def database_url_for(self, database: str) -> str:
        # URL.create escapes special characters in the password.
        return URL.create(
            "postgresql+psycopg2",
            username=self.postgres_user,
            password=self.postgres_password,
            host=self.postgres_host,
            port=self.postgres_port,
            database=database,
        ).render_as_string(hide_password=False)

    @property
    def database_url(self) -> str:
        return self.database_url_for(self.postgres_db)


settings = Settings()
