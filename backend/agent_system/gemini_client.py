import os
import json
import urllib.request
import urllib.error
import logging
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

class GeminiClient:
    """
    Lightweight, robust client for Google Gemini models using standard urllib.
    Supports auto-retry, model fallbacks (gemini-2.5-flash -> gemini-1.5-flash),
    and structured JSON schema extraction with deterministic offline fallbacks.
    """
    DEFAULT_MODELS = ["gemini-2.5-flash", "gemini-1.5-flash", "gemini-pro"]

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY", "")

    def is_configured(self) -> bool:
        return bool(self.api_key and len(self.api_key.strip()) > 5)

    def generate_content(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        json_mode: bool = False,
        temperature: float = 0.4,
    ) -> Dict[str, Any]:
        """
        Calls the Gemini REST API. Returns a dictionary with 'text', 'raw', 'model', and 'tokens_estimated'.
        """
        if not self.is_configured():
            logger.warning("GEMINI_API_KEY is not configured or invalid. Using domain heuristic generator.")
            return {"text": "", "model": "offline-fallback", "tokens_estimated": 0, "success": False}

        payload: Dict[str, Any] = {
            "contents": [
                {
                    "parts": [{"text": prompt}]
                }
            ],
            "generationConfig": {
                "temperature": temperature,
                "maxOutputTokens": 4096,
            }
        }

        if system_instruction:
            payload["systemInstruction"] = {
                "parts": [{"text": system_instruction}]
            }

        if json_mode:
            payload["generationConfig"]["responseMimeType"] = "application/json"

        data = json.dumps(payload).encode("utf-8")

        for model_name in self.DEFAULT_MODELS:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={self.api_key}"
            req = urllib.request.Request(
                url,
                data=data,
                headers={"Content-Type": "application/json"},
                method="POST"
            )
            try:
                with urllib.request.urlopen(req, timeout=30) as resp:
                    if resp.status == 200:
                        res_json = json.loads(resp.read().decode("utf-8"))
                        candidates = res_json.get("candidates", [])
                        if candidates:
                            content = candidates[0].get("content", {})
                            parts = content.get("parts", [])
                            text_out = "".join([p.get("text", "") for p in parts])
                            usage = res_json.get("usageMetadata", {})
                            total_tokens = usage.get("totalTokenCount", len(prompt.split()) + len(text_out.split()))
                            return {
                                "text": text_out,
                                "model": model_name,
                                "tokens_estimated": total_tokens,
                                "success": True,
                                "raw": res_json
                            }
            except urllib.error.HTTPError as http_err:
                logger.warning(f"Gemini API model {model_name} HTTP {http_err.code}: {http_err.reason}")
            except Exception as e:
                logger.warning(f"Gemini API model {model_name} failed: {str(e)}")

        return {"text": "", "model": "offline-fallback", "tokens_estimated": 0, "success": False}

    def generate_json(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        fallback_data: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Attempts to generate structured JSON. If the response fails or is not valid JSON, returns fallback_data.
        """
        res = self.generate_content(prompt, system_instruction=system_instruction, json_mode=True)
        if res.get("success") and res.get("text"):
            try:
                # Clean up any potential markdown code blocks like ```json ... ```
                clean_text = res["text"].strip()
                if clean_text.startswith("```"):
                    lines = clean_text.splitlines()
                    if lines[0].startswith("```"):
                        lines = lines[1:]
                    if lines and lines[-1].startswith("```"):
                        lines = lines[:-1]
                    clean_text = "\n".join(lines).strip()
                parsed = json.loads(clean_text)
                return {
                    "data": parsed,
                    "tokens_used": res.get("tokens_estimated", 0),
                    "model": res.get("model", "gemini"),
                    "from_llm": True
                }
            except Exception as parse_err:
                logger.warning(f"Failed to parse LLM JSON: {parse_err}")

        return {
            "data": fallback_data or {},
            "tokens_used": 0,
            "model": "heuristic-engine",
            "from_llm": False
        }
