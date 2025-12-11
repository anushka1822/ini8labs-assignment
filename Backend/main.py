from fastapi import FastAPI, UploadFile, File, Depends, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text
import boto3
from botocore.config import Config
import uuid
import os
from dotenv import load_dotenv

from database import engine, get_db
import models

# 1. Setup & Config
load_dotenv()
models.Base.metadata.create_all(bind=engine) 

app = FastAPI()

# Allow CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# AWS S3 Client (Fixed with s3v4 Config & Hardcoded Region)
s3_client = boto3.client(
    "s3",
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
    region_name="eu-north-1", # Hardcoded to match your bucket
    config=Config(signature_version='s3v4')
)
BUCKET_NAME = os.getenv("S3_BUCKET_NAME")

# 2. API Endpoints

@app.post("/documents/upload")
async def upload_document(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    # 1. Calculate File Size
    file.file.seek(0, 2)      # Move cursor to the end of the file
    file_size = file.file.tell() # Read the position (this is the size in bytes)
    file.file.seek(0)         # RESET cursor to the start so we can upload it!

    file_ext = file.filename.split(".")[-1]
    unique_filename = f"{uuid.uuid4()}.{file_ext}"
    
    try:
        # Upload file
        s3_client.upload_fileobj(
            file.file, 
            BUCKET_NAME, 
            unique_filename,
            ExtraArgs={'ContentType': 'application/pdf'}
        )
        
        # Save Metadata with REAL Size
        new_doc = models.Document(
            filename=file.filename,
            s3_key=unique_filename,
            filesize=file_size, # <--- Saving the actual size now
        )
        db.add(new_doc)
        db.commit()
        db.refresh(new_doc)
        
        return {"message": "Upload successful", "id": new_doc.id, "filename": new_doc.filename}
        
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to upload file")
    
@app.get("/documents")
def list_documents(db: Session = Depends(get_db)):
    return db.query(models.Document).all()

@app.get("/documents/{doc_id}")
def download_document(doc_id: int, download: bool = False, db: Session = Depends(get_db)):
    doc = db.query(models.Document).filter(models.Document.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    try:
        # Proxy: Get file from S3 to Backend
        file_obj = s3_client.get_object(Bucket=BUCKET_NAME, Key=doc.s3_key)
        
        # Determine mode: Attachment (Download) vs Inline (View)
        disposition_type = "attachment" if download else "inline"
        
        # Stream from Backend to Browser
        return StreamingResponse(
            file_obj["Body"], 
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"{disposition_type}; filename={doc.filename}"
            }
        )
    except Exception as e:
        print(f"Download error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch document")

@app.delete("/documents/{doc_id}")
def delete_document(doc_id: int, db: Session = Depends(get_db)):
    doc = db.query(models.Document).filter(models.Document.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    try:
        s3_client.delete_object(Bucket=BUCKET_NAME, Key=doc.s3_key)
        db.delete(doc)
        db.commit()
        return {"message": "Document deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to delete document")