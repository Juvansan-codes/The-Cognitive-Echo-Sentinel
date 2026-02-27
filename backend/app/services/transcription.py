"""
Groq Whisper Speech-to-Text transcription service.
"""

from __future__ import annotations

import os
import logging
import httpx

logger = logging.getLogger("cognitive-echo")

async def transcribe_audio(audio_bytes: bytes) -> str | None:
    """
    Transcribe raw audio bytes using Groq's whisper-large-v3 endpoint.
    Returns the transcript string on success, or None on failure.
    """
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        logger.warning("GROQ_API_KEY missing - skipping transcription")
        return None

    logger.info("📝 Transcription started (%d bytes)", len(audio_bytes))

    url = "https://api.groq.com/openai/v1/audio/transcriptions"
    headers = {
        "Authorization": f"Bearer {api_key}"
    }
    
    # We pass the bytes directly. Groq inherently detects webm/wav magic bytes.
    files = {
        "file": ("audio.wav", audio_bytes, "audio/wav")
    }
    data = {
        "model": "whisper-large-v3"
    }

    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(url, headers=headers, data=data, files=files)
            response.raise_for_status()
            
            result = response.json()
            transcript = result.get("text", "").strip()
            
            preview = transcript if len(transcript) <= 50 else transcript[:47] + "..."
            logger.info('✅ Transcript received (%d chars): "%s"', len(transcript), preview)
            return transcript

    except httpx.HTTPStatusError as e:
        logger.error("❌ Groq STT failed: HTTP %d - %s — lexical analysis will be skipped", e.response.status_code, e.response.text)
        return None
    except Exception as e:
        logger.error("❌ Groq STT failed: %s — lexical analysis will be skipped", str(e))
        return None
