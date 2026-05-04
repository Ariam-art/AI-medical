from pydantic import BaseModel


class RegisterRequest(BaseModel):
    username: str
    password: str
    role: str


class LoginRequest(BaseModel):
    username: str
    password: str


class PredictRequest(BaseModel):
    username: str
    symptoms: str
    
    
class AccessRequestCreate(BaseModel):
    doctor_username: str
    patient_username: str


class AccessRequestAction(BaseModel):
    request_id: int
    patient_username: str
    action: str  
