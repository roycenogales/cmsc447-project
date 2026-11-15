from fastapi import FastAPI, APIRouter, Depends, HTTPException, status
#from fastapi import FastAPI, Depends
from app.services.auth import authenticate_user


#app = FastAPI(title="Authentication Demo", version="1.0.0")
router = APIRouter(prefix="/login", tags=["login"])

'''
@router.get("/") #changed from app to router
async def root():
    return {"message": "Welcome to FastAPI Authentication Demo"}
'''
@router.get("/login")
async def protected_route(current_user: str = Depends(authenticate_user)):
    return {"message": f"Hello {current_user}, this is the login route!"}
