from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models
from app.models import User as UserModel, File as FileModel
from app.auth import get_current_user
import os
import uuid
import shutil
from fastapi.responses import FileResponse
from fastapi import FastAPI, Depends, HTTPException, UploadFile, File


router = APIRouter()

UPLOAD_DIR = "uploaded"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload")
def upload_file(
    uploaded_file: UploadFile = File(...),
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    file_location = os.path.join(UPLOAD_DIR, uploaded_file.filename)
    with open(file_location, "wb") as f:
        shutil.copyfileobj(uploaded_file.file, f)

    db_file = FileModel(filename=uploaded_file.filename, user_id=current_user.id)
    db.add(db_file)
    db.commit()
    db.refresh(db_file)
    return {
        "filename": uploaded_file.filename,
        "file_id": db_file.id,
        "message": "Dosya başarıyla yüklendi!"
    }



@router.get("/myfiles")
def get_my_files(current_user: UserModel = Depends(get_current_user), db: Session = Depends(get_db)):
    files = db.query(FileModel).filter(FileModel.user_id == current_user.id).all()
    return files


@router.delete("/files/{file_id}")
def delete_file(file_id: int, current_user: UserModel = Depends(get_current_user), db: Session = Depends(get_db)):
    file_to_delete = db.query(FileModel).filter(FileModel.id == file_id).first()
    if file_to_delete and file_to_delete.user_id == current_user.id:
        db.delete(file_to_delete)
        db.commit()
        return {"message": "Dosya başarıyla silindi"}
    raise HTTPException(status_code=404, detail="Dosya bulunamadı")



@router.put("/files/{file_id}")
def update_file(file_id: int, uploaded_file: UploadFile = File(...), current_user: UserModel = Depends(get_current_user), db: Session = Depends(get_db)):
    file_to_update = db.query(FileModel).filter(FileModel.id == file_id).first()
    if file_to_update and file_to_update.user_id == current_user.id:
        file_location = os.path.join(UPLOAD_DIR, uploaded_file.filename)
        with open(file_location, "wb") as f:
            shutil.copyfileobj(uploaded_file.file, f)
        file_to_update.filename = uploaded_file.filename
        db.commit()
        return {"message": "Dosya başarıyla güncellendi"}
    raise HTTPException(status_code=404, detail="Dosya bulunamadı")


@router.post("/sendfile")
def send_file(
    receiver_id: int,
    uploaded_file: UploadFile = File(...),
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Dosyayı fiziksel olarak kaydet
    file_location = os.path.join(UPLOAD_DIR, uploaded_file.filename)
    with open(file_location, "wb") as f:
        shutil.copyfileobj(uploaded_file.file, f)

    
    shared_file = FileModel(
        filename=uploaded_file.filename,
        user_id=receiver_id,  
        receiver_id=None      
    )
    db.add(shared_file)
    db.commit()
    db.refresh(shared_file)

    return {
        "message": "Dosya başarıyla gönderildi ve paylaşıldı!",
        "file_id": shared_file.id,
        "to_user": receiver_id
    }


@router.get("/shared-with-me")
def get_shared_files(
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    files = db.query(FileModel).filter(FileModel.receiver_id == current_user.id).all()
    return {
        "shared_files": [
            {
                "file_id": file.id,
                "filename": file.filename,
                "from_user": file.user_id
            }
            for file in files
        ]
    }


@router.get("/files/{file_id}")
def get_file(file_id: int, db: Session = Depends(get_db)):
    file_record = db.query(models.File).filter(models.File.id == file_id).first()
    if not file_record:
        raise HTTPException(status_code=404, detail="Dosya bulunamadı")

    file_path = os.path.join(UPLOAD_DIR, file_record.filename)
    return FileResponse(path=file_path, filename=file_record.filename, media_type='application/octet-stream')