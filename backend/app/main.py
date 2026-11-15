import logging

from fastapi import FastAPI, Depends, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.routers import health, metrics, uploads, auth

logger = logging.getLogger(__name__)

app = FastAPI(title="Retriever Essentials Dashboard API")

'''
# may or may not need this, unsure rn

@app.get("/")
async def root():
    return {"message": "Welcome to FastAPI Authentication Demo"}

@app.get("/protected")
async def protected_route(current_user: str = Depends(authenticate_user)):
    return {"message": f"Hello {current_user}, this is a protected route!"}
'''
# Registered before CORSMiddleware so CORS wraps it. Otherwise unhandled errors reach
# Starlette's outer error handler and the 500 goes out without CORS headers, which the
# browser reports as an opaque "Failed to fetch".
@app.middleware("http")
async def catch_unhandled_errors(request: Request, call_next) -> Response:
    try:
        return await call_next(request)
    except Exception:
        logger.exception("Unhandled error on %s %s", request.method, request.url.path)
        return JSONResponse(status_code=500, content={"detail": "Internal server error"})


app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_origin_regex=settings.cors_origin_regex,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(uploads.router)
app.include_router(metrics.router)

app.include_router(auth.router)
