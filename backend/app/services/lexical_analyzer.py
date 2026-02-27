"""
Featherless AI Lexical Cognition Analyzer.

Isolated service module that calls Featherless AI (Llama 3 70B) to evaluate
cognitive-linguistic markers from a speech transcript. Returns structured
scores for vocabulary richness, coherence, word-finding difficulty,
repetition tendency, and an overall cognitive concern level.

Medical-grade reliability:
  - Up to 2 automatic retries with exponential backoff
  - Never fabricates metrics on failure
  - Raises clean errors for the caller to handle honestly
"""

from __future__ import annotations

import asyncio
import json
import logging
import os
from typing import Any

import httpx

logger = logging.getLogger("cognitive-echo.lexical")

# ─── Configuration ────────────────────────────────────────────────────────────

FEATHERLESS_API_URL = "https://api.featherless.ai/v1/chat/completions"
FEATHERLESS_MODEL = "meta-llama/Meta-Llama-3-8B-Instruct"
FEATHERLESS_TEMPERATURE = 0.4
FEATHERLESS_MAX_TOKENS = 300
REQUEST_TIMEOUT_SECONDS = 60.0
MAX_RETRIES = 2
BASE_BACKOFF_SECONDS = 1.0

# ─── System prompt ────────────────────────────────────────────────────────────

_SYSTEM_PROMPT = (
    "You are a strict clinical neurolinguistics expert. "
    "Analyze the following speech transcript for cognitive-linguistic markers. "
    "Evaluate ONLY the specific linguistic dimensions below based strictly on the source text.\n\n"
    "CRITICAL: Do NOT default to generic scores like '0.1' or '0.2'. You MUST use the full floating-point scale (0.00 to 1.00) "
    "to reflect subtle degrees of impairment or fluency accurately.\n\n"
    "Return a JSON object with exactly these keys:\n"
    '  "vocabulary_richness"      – float 0.00 to 1.00 (1.00 = highly sophisticated, diverse vocabulary)\n'
    '  "sentence_coherence"       – float 0.00 to 1.00 (1.00 = perfectly logical, unbroken flow)\n'
    '  "word_finding_difficulty"  – float 0.00 to 1.00 (1.00 = severe blocking, excessive fillers like "uh", substituting vague words)\n'
    '  "repetition_tendency"      – float 0.00 to 1.00 (1.00 = highly repetitive loops or echoing)\n'
    '  "cognitive_concern"        – string, strictly one of "Low", "Medium", or "High" depending on severity.\n'
    "\n"
    "Return ONLY valid JSON. No markdown fences, no explanation, no extra text."
)

_USER_PROMPT_TEMPLATE = "Transcript:\n\n{transcript}"


# ─── Public API ───────────────────────────────────────────────────────────────

async def analyze_lexical_cognition(transcript: str) -> dict[str, Any]:
    """
    Analyze cognitive-linguistic markers in a speech transcript using
    Featherless AI (Llama 3 70B).
    """
    # ── Input validation ──────────────────────────────────────────────
    if not transcript or not transcript.strip():
        logger.warning("LLM_CALL_FAILED: Transcript is empty")
        raise ValueError("Transcript must be a non-empty string.")

    transcript_len = len(transcript.strip())
    if transcript_len < 10:
        logger.warning("LLM_CALL_FAILED: Transcript too short (%d chars)", transcript_len)
        raise ValueError("Transcript must be at least 10 characters for lexical analysis.")

    # ── Resolve API key ───────────────────────────────────────────────
    api_key = os.getenv("FEATHERLESS_API_KEY")
    if not api_key:
        logger.error("LLM_CALL_FAILED: FEATHERLESS_API_KEY environment variable is missing.")
        raise RuntimeError("Featherless API key is not configured. Set the FEATHERLESS_API_KEY environment variable.")

    # ── Build request payload ─────────────────────────────────────────
    payload: dict[str, Any] = {
        "model": FEATHERLESS_MODEL,
        "temperature": FEATHERLESS_TEMPERATURE,
        "max_tokens": FEATHERLESS_MAX_TOKENS,
        "messages": [
            {"role": "system", "content": _SYSTEM_PROMPT},
            {
                "role": "user",
                "content": _USER_PROMPT_TEMPLATE.format(
                    transcript=transcript.strip()
                ),
            },
        ],
    }

    headers: dict[str, str] = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }

    # ── Call Featherless API (with retry + backoff) ───────────────────
    logger.info("LLM_CALL_STARTED: Sending transcript (%d chars) to %s", transcript_len, FEATHERLESS_MODEL)

    last_error: Exception | None = None
    response = None

    for attempt in range(1, MAX_RETRIES + 2):  # attempt 1, 2, 3
        try:
            async with httpx.AsyncClient(
                timeout=httpx.Timeout(REQUEST_TIMEOUT_SECONDS)
            ) as client:
                response = await client.post(
                    FEATHERLESS_API_URL,
                    json=payload,
                    headers=headers,
                )
            
            # Handle specific auth or bad request errors immediately without retrying
            if response.status_code in (401, 403):
                logger.error("LLM_CALL_FAILED: Authentication error (HTTP %d)", response.status_code)
                raise RuntimeError(f"Invalid or unauthorized Featherless API Key (HTTP {response.status_code})")
            
            # Raise exception for other errors (e.g., 500, 429) to trigger retry
            response.raise_for_status()
            
            break  # success – exit retry loop
            
        except httpx.TimeoutException as exc:
            last_error = exc
            logger.warning("Featherless API timeout (attempt %d/%d): %s", attempt, MAX_RETRIES + 1, exc)
        except httpx.HTTPStatusError as exc:
            last_error = exc
            logger.warning("Featherless API HTTP error %d (attempt %d/%d): %s", exc.response.status_code, attempt, MAX_RETRIES + 1, exc)
        except httpx.RequestError as exc:
            last_error = exc
            logger.warning("Featherless API Request error (attempt %d/%d): %s", attempt, MAX_RETRIES + 1, exc)

        if attempt <= MAX_RETRIES:
            backoff = BASE_BACKOFF_SECONDS * (2 ** (attempt - 1))
            logger.info("Retrying in %.1fs…", backoff)
            await asyncio.sleep(backoff)
    else:
        # All retries exhausted
        error_msg = f"Featherless API unreachable after {MAX_RETRIES + 1} attempts. Last error: {last_error}"
        logger.error("LLM_CALL_FAILED: %s", error_msg)
        raise RuntimeError(error_msg)

    # ── Extract completion text ───────────────────────────────────────
    try:
        api_response: dict[str, Any] = response.json()
        content: str = api_response["choices"][0]["message"]["content"].strip()
    except (KeyError, IndexError, TypeError, ValueError) as exc:
        logger.error("LLM_CALL_FAILED: Unexpected API response structure. HTTP %d: %s", response.status_code, exc)
        if response.text:
            logger.debug("Raw response: %s", response.text[:500])
        raise RuntimeError("Featherless API returned an unexpected response format.") from exc

    logger.info("LLM_CALL_SUCCESS: Received Featherless response (%d chars). HTTP: %d", len(content), response.status_code)

    # ── Parse JSON from LLM output ────────────────────────────────────
    result = _parse_llm_json(content)

    # ── Validate required keys ────────────────────────────────────────
    _validate_result(result)

    return result


# ─── Internal Helpers ─────────────────────────────────────────────────────────

def _parse_llm_json(raw: str) -> dict[str, Any]:
    """
    Attempt to parse JSON from the LLM's raw text output.

    Handles common issues like markdown fences wrapping the JSON.
    """
    # Strip markdown code fences if present
    cleaned = raw.strip()
    if cleaned.startswith("```"):
        # Remove opening fence (with optional language tag)
        first_newline = cleaned.index("\n") if "\n" in cleaned else 3
        cleaned = cleaned[first_newline + 1 :]
    if cleaned.endswith("```"):
        cleaned = cleaned[: -3]
    cleaned = cleaned.strip()

    try:
        parsed = json.loads(cleaned)
    except json.JSONDecodeError as exc:
        logger.error("Failed to parse LLM JSON output: %s | Raw: %s", exc, raw[:300])
        raise RuntimeError(
            "Featherless AI did not return valid JSON. "
            f"Raw output: {raw[:200]}"
        ) from exc

    if not isinstance(parsed, dict):
        raise RuntimeError(
            f"Expected a JSON object from Featherless AI, got {type(parsed).__name__}."
        )

    return parsed


_REQUIRED_KEYS: dict[str, type] = {
    "vocabulary_richness": float,
    "sentence_coherence": float,
    "word_finding_difficulty": float,
    "repetition_tendency": float,
    "cognitive_concern": str,
}

_VALID_CONCERNS: set[str] = {"Low", "Medium", "High"}


def _validate_result(result: dict[str, Any]) -> None:
    """Ensure the parsed result contains all required keys with valid types."""
    for key, expected_type in _REQUIRED_KEYS.items():
        if key not in result:
            raise RuntimeError(
                f"Featherless AI response is missing required key: '{key}'."
            )
        value = result[key]

        # Accept int as float for numeric fields
        if expected_type is float and isinstance(value, (int, float)):
            result[key] = float(value)
        elif not isinstance(value, expected_type):
            raise RuntimeError(
                f"Key '{key}' has invalid type {type(value).__name__}, "
                f"expected {expected_type.__name__}."
            )

    # Validate cognitive_concern enum
    if result["cognitive_concern"] not in _VALID_CONCERNS:
        raise RuntimeError(
            f"'cognitive_concern' must be one of {_VALID_CONCERNS}, "
            f"got '{result['cognitive_concern']}'."
        )

    # Clamp numeric scores to 0–1 range
    for key in ("vocabulary_richness", "sentence_coherence",
                "word_finding_difficulty", "repetition_tendency"):
        result[key] = max(0.0, min(1.0, result[key]))
