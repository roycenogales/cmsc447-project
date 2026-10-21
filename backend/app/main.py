from fastapi import FastAPI

from app.routers import health, metrics, uploads

app = FastAPI(title="Retriever Essentials Dashboard API")

app.include_router(health.router)
app.include_router(uploads.router)
app.include_router(metrics.router)
