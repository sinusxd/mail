import httpx

OLLAMA_URL = "http://localhost:11434/v1/chat/completions"
MODEL_NAME = "mistral"


async def generate_completion(prompt: str) -> str:
    payload = {
        "model": MODEL_NAME,
        "messages": [
            {"role": "system", "content": "Ты полезный помощник."},
            {"role": "user", "content": prompt}
        ]
    }

    async with httpx.AsyncClient(timeout=120.0) as client:
        response = await client.post(OLLAMA_URL, json=payload)
        response.raise_for_status()

        data = response.json()
        return data["choices"][0]["message"]["content"]
