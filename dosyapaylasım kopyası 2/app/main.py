from fastapi import FastAPI
from app import auth, file  # app klasörünün dışındaysan
from fastapi.middleware.cors import CORSMiddleware
from app.models import Base
from app.database import engine

Base.metadata.create_all(bind=engine)

app = FastAPI()

# CORS (frontend bağlantısı için gerekli)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(file.router)

@app.get("/")
def read_root():
    return {"message": "Dosya paylaşım uygulamasına hoş geldin!"}