from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any

from agents.supervisor import run

app = FastAPI(title="Automotive Multi-Agent API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class QueryRequest(BaseModel):
    question: str
    vehicle_context: Optional[Dict[str, Any]] = None


@app.get("/")
def root():
    return {"status": "running"}


@app.post("/query")
def query(data: QueryRequest):
    return run(
        data.question,
        vehicle_context=data.vehicle_context or {}
    )