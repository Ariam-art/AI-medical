from pydantic import BaseModel
from typing import Literal


class RegisterRequest(BaseModel):
    username: str
    password: str
    role: Literal["user", "doctor"]


class LoginRequest(BaseModel):
    username: str
    password: str


class PredictRequest(BaseModel):
    symptoms: str


class AccessRequestCreate(BaseModel):
    patient_username: str


class AccessRequestAction(BaseModel):
    request_id: int
    action: Literal["accepted", "reject"]