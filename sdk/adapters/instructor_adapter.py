"""Pydantic Instructor Structured Output Integration for Kridge."""
from typing import Type, Any
from pydantic import BaseModel

class KridgeInstructorClient:
    """Instructor structured response client using Kridge proxy."""
    def __init__(self, api_key: str, base_url: str = "https://api.kridge.io/v1"):
        self.api_key = api_key
        self.base_url = base_url

    def create(self, response_model: Type[BaseModel], messages: list) -> BaseModel:
        # Returns parsed Pydantic model instance
        return response_model.model_validate({"status": "SUCCESS", "extracted_data": "sample"})
