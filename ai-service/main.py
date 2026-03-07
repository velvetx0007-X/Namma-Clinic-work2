import os
import io
import json
import base64
from typing import List, Optional
from fastapi import FastAPI, UploadFile, File, Header, HTTPException, Depends, Security
from fastapi.security.api_key import APIKeyHeader
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Health One AI Service")

# Security
API_TOKEN = os.getenv("AI_SERVICE_TOKEN", "default_secret_token_123")
api_key_header = APIKeyHeader(name="Authorization", auto_error=False)

def get_api_key(api_key_header: str = Security(api_key_header)):
    if not api_key_header or not api_key_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid token")
    token = api_key_header.split(" ")[1]
    if token != API_TOKEN:
        raise HTTPException(status_code=403, detail="Forbidden: Invalid token")
    return token

# Gemini API Initialization
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
else:
    print("WARNING: GEMINI_API_KEY not found in environment")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class Medication(BaseModel):
    drugName: str
    dosage: str
    frequency: str
    duration: str
    instructions: str

class PrescriptionResponse(BaseModel):
    complaints: str
    vitals: str
    diagnosis: str
    advice: str
    investigations: str
    followUp: str
    medications: List[Medication]

class LabResult(BaseModel):
    parameter: str
    value: str
    unit: str
    referenceRange: Optional[str] = None

class LabTestResponse(BaseModel):
    testName: str
    patientName: str
    date: str
    results: List[LabResult]
    conclusion: str

@app.get("/health")
async def health_check():
    return {"status": "healthy", "ai_ready": GEMINI_API_KEY is not None}

@app.post("/process-prescription", response_model=PrescriptionResponse)
async def process_prescription(
    file: UploadFile = File(...),
    token: str = Depends(get_api_key)
):
    if not GEMINI_API_KEY:
        raise HTTPException(status_code=503, detail="AI Service configuration missing")

    contents = await file.read()
    
    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        
        prompt = """
            Extract medical information from this prescription image/PDF. 
            Return it in the following JSON format ONLY:
            {
                "complaints": "string",
                "vitals": "string",
                "diagnosis": "string",
                "advice": "string",
                "investigations": "string",
                "followUp": "string",
                "medications": [
                    { "drugName": "string", "dosage": "string", "frequency": "string", "duration": "string", "instructions": "string" }
                ]
            }
            If any information is missing, use "Not provided". 
            Ensure "medications" is an array of objects even if only one medication is found.
        """
        
        # Prepare the file part
        image_part = {
            "mime_type": file.content_type,
            "data": contents
        }
        
        response = model.generate_content([prompt, image_part])
        
        # Extract JSON from response
        text = response.text
        json_start = text.find('{')
        json_end = text.rfind('}') + 1
        if json_start == -1 or json_end == 0:
            raise ValueError("No JSON found in AI response")
        
        data = json.loads(text[json_start:json_end])
        return data
        
    except Exception as e:
        print(f"Error processing prescription: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/process-lab-test", response_model=LabTestResponse)
async def process_lab_test(
    file: UploadFile = File(...),
    token: str = Depends(get_api_key)
):
    if not GEMINI_API_KEY:
        raise HTTPException(status_code=503, detail="AI Service configuration missing")

    contents = await file.read()
    
    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        
        prompt = """
            Extract medical lab test data from this document. 
            Return ONLY a JSON object with the following structure:
            {
                "testName": "Name of the overall test/panel",
                "patientName": "Full name of the patient",
                "date": "Date of the test",
                "results": [
                    {"parameter": "Hemoglobin", "value": "13.5", "unit": "g/dL", "referenceRange": "12.0-15.5"},
                    {"parameter": "WBC Count", "value": "7500", "unit": "/uL", "referenceRange": "4000-11000"}
                ],
                "conclusion": "Any overall impression or summary if present"
            }
            If any field is missing, use null or an empty array.
        """
        
        image_part = {
            "mime_type": file.content_type,
            "data": contents
        }
        
        response = model.generate_content([prompt, image_part])
        
        text = response.text
        json_start = text.find('{')
        json_end = text.rfind('}') + 1
        if json_start == -1 or json_end == 0:
            raise ValueError("No JSON found in AI response")
            
        data = json.loads(text[json_start:json_end])
        return data
        
    except Exception as e:
        print(f"Error processing lab test: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
