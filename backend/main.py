from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
import uvicorn
from ml_service import get_company_info, predict_revenue, get_summary

app = FastAPI(title="Financial Dashboard API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/companies")
def get_companies():
    return get_company_info()

@app.get("/api/predict")
def predict(company: str, quarter: str, year: int):
    return predict_revenue(company, quarter, year)

@app.get("/api/summary")
def summary(quarter: str = "Q1", year: int = 2026):
    return get_summary(quarter, year)

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
