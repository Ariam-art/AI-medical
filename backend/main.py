import json
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from backend.database import Base, engine, SessionLocal
from backend.models import User, PredictionHistory, AccessRequest
from backend.schemas import (
    RegisterRequest,
    LoginRequest,
    PredictRequest,
    AccessRequestCreate,
    AccessRequestAction,
)
from ai.predict import predict_disease


Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI Medical Screening and Decision Support System",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


@app.get("/health")
def health_check():
    return {"status": "running"}


@app.post("/register")
def register(request: RegisterRequest, db: Session = Depends(get_db)):
    role = request.role.lower().strip()

    if role not in ["user", "doctor"]:
        raise HTTPException(status_code=400, detail="Role must be user or doctor")

    existing_user = db.query(User).filter(User.username == request.username).first()

    if existing_user:
        raise HTTPException(status_code=400, detail="Username already exists")

    user = User(
        username=request.username,
        password=request.password,
        role=role,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return {
        "message": "User registered successfully",
        "username": user.username,
        "role": user.role,
    }


@app.post("/login")
def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(
        User.username == request.username,
        User.password == request.password,
    ).first()

    if not user:
        raise HTTPException(status_code=401, detail="Invalid username or password")

    return {
        "message": "Login successful",
        "username": user.username,
        "role": user.role,
    }


@app.post("/predict")
def predict(request: PredictRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == request.username).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    prediction_result = predict_disease(request.symptoms)

    history = PredictionHistory(
        username=request.username,
        symptoms=request.symptoms,
        result=json.dumps(prediction_result),
    )

    db.add(history)
    db.commit()
    db.refresh(history)

    return {
        "message": "Prediction completed",
        "username": request.username,
        "role": user.role,
        "result": prediction_result,
    }


@app.get("/history/{username}")
def get_user_history(username: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == username).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    records = db.query(PredictionHistory).filter(
        PredictionHistory.username == username
    ).order_by(PredictionHistory.created_at.desc()).all()

    return [
        {
            "id": record.id,
            "username": record.username,
            "symptoms": record.symptoms,
            "result": json.loads(record.result),
            "created_at": record.created_at,
        }
        for record in records
    ]


@app.delete("/history/{history_id}")
def delete_history(history_id: int, username: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == username).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    record = db.query(PredictionHistory).filter(
        PredictionHistory.id == history_id
    ).first()

    if not record:
        raise HTTPException(status_code=404, detail="History record not found")
 # Users and doctors can delete only their own history from My History page.
    if record.username != username:
        raise HTTPException(
            status_code=403,
            detail="You can only delete your own history",
        )

    db.delete(record)
    db.commit()

    return {
        "message": "History record deleted successfully",
        "deleted_id": history_id,
    }


@app.post("/access-request")
def create_access_request(request: AccessRequestCreate, db: Session = Depends(get_db)):
    doctor = db.query(User).filter(
        User.username == request.doctor_username
    ).first()

    patient = db.query(User).filter(
        User.username == request.patient_username
    ).first()

    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")

    if doctor.role != "doctor":
        raise HTTPException(status_code=403, detail="Only doctors can request access")

    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    if patient.role != "user":
        raise HTTPException(
            status_code=400,
            detail="Access can only be requested from users/patients",
        )

    existing_pending = db.query(AccessRequest).filter(
        AccessRequest.doctor_username == request.doctor_username,
        AccessRequest.patient_username == request.patient_username,
        AccessRequest.status == "pending",
    ).first()

    if existing_pending:
        raise HTTPException(status_code=400, detail="Access request already pending")

    existing_accepted = db.query(AccessRequest).filter(
        AccessRequest.doctor_username == request.doctor_username,
        AccessRequest.patient_username == request.patient_username,
        AccessRequest.status == "accepted",
    ).first()

    if existing_accepted:
        raise HTTPException(status_code=400, detail="Access already accepted")

    access_request = AccessRequest(
        doctor_username=request.doctor_username,
        patient_username=request.patient_username,
        status="pending",
    )

    db.add(access_request)
    db.commit()
    db.refresh(access_request)

    return {
        "message": "Access request sent successfully",
        "request_id": access_request.id,
        "doctor_username": access_request.doctor_username,
        "patient_username": access_request.patient_username,
        "status": access_request.status,
    }


@app.get("/access-requests/{patient_username}")
def get_patient_access_requests(patient_username: str, db: Session = Depends(get_db)):
    patient = db.query(User).filter(User.username == patient_username).first()

    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    requests = db.query(AccessRequest).filter(
        AccessRequest.patient_username == patient_username
    ).order_by(AccessRequest.created_at.desc()).all()

    return [
        {
            "id": request.id,
            "doctor_username": request.doctor_username,
            "patient_username": request.patient_username,
            "status": request.status,
            "created_at": request.created_at,
        }
        for request in requests
    ]


@app.post("/access-request/respond")
def respond_access_request(
    request: AccessRequestAction,
    db: Session = Depends(get_db),
):
    if request.action not in ["accepted", "rejected"]:
        raise HTTPException(
            status_code=400,
            detail="Action must be accepted or rejected",
        )

    access_request = db.query(AccessRequest).filter(
        AccessRequest.id == request.request_id
    ).first()

    if not access_request:
        raise HTTPException(status_code=404, detail="Access request not found")

    if access_request.patient_username != request.patient_username:
        raise HTTPException(
            status_code=403,
            detail="You can only respond to your own requests",
        )

    access_request.status = request.action

    db.commit()
    db.refresh(access_request)
    return {
        "message": f"Request {request.action} successfully",
        "request_id": access_request.id,
        "doctor_username": access_request.doctor_username,
        "patient_username": access_request.patient_username,
        "status": access_request.status,
    }


@app.get("/doctor/history")
def get_doctor_history(username: str, db: Session = Depends(get_db)):
    doctor = db.query(User).filter(User.username == username).first()

    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")

    if doctor.role != "doctor":
        raise HTTPException(
            status_code=403,
            detail="Only doctors can access doctor dashboard",
        )

    approved_requests = db.query(AccessRequest).filter(
        AccessRequest.doctor_username == username,
        AccessRequest.status == "accepted",
    ).all()

    approved_patients = [
        request.patient_username
        for request in approved_requests
    ]

    if not approved_patients:
        return []

    records = db.query(PredictionHistory).filter(
        PredictionHistory.username.in_(approved_patients)
    ).order_by(PredictionHistory.created_at.desc()).all()

    return [
        {
            "id": record.id,
            "username": record.username,
            "symptoms": record.symptoms,
            "result": json.loads(record.result),
            "created_at": record.created_at,
        }
        for record in records
    ]
    
    
    
@app.get("/debug/access")
def debug_access(db: Session = Depends(get_db)):
    requests = db.query(AccessRequest).all()
    histories = db.query(PredictionHistory).all()

    return {
        "access_requests": [
            {
                "id": request.id,
                "doctor_username": request.doctor_username,
                "patient_username": request.patient_username,
                "status": request.status,
            }
            for request in requests
        ],
        "prediction_history": [
            {
                "id": history.id,
                "username": history.username,
                "symptoms": history.symptoms,
            }
            for history in histories
        ],
    }