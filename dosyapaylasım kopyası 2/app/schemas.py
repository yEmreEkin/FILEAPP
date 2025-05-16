from pydantic import BaseModel

class UserCreate(BaseModel):
    username: str
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class FileBase(BaseModel):
    filename: str

class FileCreate(FileBase):
    pass

class FileOut(FileBase):
    id: int
    owner_id: int

    class Config:
        orm_mode = True
