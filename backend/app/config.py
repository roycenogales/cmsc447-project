from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """App settings, read from environment variables (or a local .env file)."""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    postgres_user: str
    postgres_password: str
    postgres_db: str
    postgres_host: str = "localhost"
    postgres_port: int = 5432
    cors_origins: list[str] = ["http://localhost:5173", "http://127.0.0.1:5173"]
    # Optional regex for extra allowed origins, e.g. the Vite dev server on a LAN IP.
    cors_origin_regex: str | None = None

    @property
    def database_url(self) -> str:
        return (
            f"postgresql+psycopg2://{self.postgres_user}:{self.postgres_password}"
            f"@{self.postgres_host}:{self.postgres_port}/{self.postgres_db}"
        )


settings = Settings()
