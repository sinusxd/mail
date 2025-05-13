from fastapi import APIRouter
from pydantic import BaseModel
from ai.service import generate_completion

router = APIRouter()

class PromptRequest(BaseModel):
    prompt: str

@router.post("/generate")
async def generate_ai_response(data: PromptRequest):
    reply = await generate_completion(data.prompt)
    return {"reply": reply}
