# 🧠 Cognitive Echo Sentinel

AI-powered cognitive health assessment through voice biomarker analysis. Record your speech, detect acoustic changes, and receive real-time cognitive risk assessments.

![Stack](https://img.shields.io/badge/Next.js-15-black?logo=next.js) ![Stack](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi) ![Stack](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript) ![Stack](https://img.shields.io/badge/Python-3.11+-3776AB?logo=python)

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** ≥ 18
- **Python** ≥ 3.10
- **pip** (or `uv` / `pipenv`)

### 1. Clone the repo

```bash
git clone https://github.com/Juvansan-codes/The-Cognitive-Echo-Sentinel.git
cd The-Cognitive-Echo-Sentinel
```

### 2. Set up the Backend

```bash
cd backend
python -m venv venv
# Windows
venv\Scripts\activate
# macOS / Linux
# source venv/bin/activate

pip install -r requirements.txt
```

### 3. Start the Backend

```bash
uvicorn app.main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`. Check health at `http://localhost:8000/health`.

### 4. Set up the Frontend

```bash
cd frontend
npm install
```

### 5. Start the Frontend

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

---

## 📊 How It Works

1. **Record** — Click the microphone button and speak for a few seconds.
2. **Analyze** — Your voice sample is sent to the backend, which extracts acoustic biomarkers (MFCC, jitter, shimmer, pitch stability, HNR, pause ratio).
3. **Compare** — A mock "Vocal Twin" baseline comparison detects drift from your stored voice profile.
4. **Score** — An Acoustic Risk Score, Cognitive Risk Score, and final Neuro Risk Indicator (Low / Medium / High) are computed.
5. **Report** — A dashboard displays all scores, feature breakdowns, AI-generated explanations, and recommendations.

---

## 🗂️ Project Structure

```
├── backend/
│   ├── app/
│   │   ├── main.py                 # FastAPI app + /api/analyze endpoint
│   │   ├── models/
│   │   │   └── schemas.py          # Pydantic request/response models
│   │   └── services/
│   │       ├── audio_features.py   # Acoustic feature extraction
│   │       └── risk_engine.py      # Risk scoring + explanation engine
│   └── requirements.txt
├── frontend/
│   └── src/
│       ├── app/
│       │   ├── layout.tsx          # Root layout + metadata
│       │   ├── page.tsx            # Main page
│       │   └── globals.css         # Dark medical theme
│       ├── components/
│       │   ├── hero-section.tsx    # Hero with gradient + feature pills
│       │   ├── audio-recorder.tsx  # MediaRecorder + waveform vis
│       │   └── dashboard.tsx       # Score cards + risk indicators
│       └── lib/
│           └── api.ts              # Typed API client
├── .env.example
├── .gitignore
└── README.md
```

---

## ⚙️ API Reference

### `GET /health`

Returns `{ "status": "ok" }`.

### `POST /api/analyze`

Upload an audio file as multipart form data.

**Request:** `multipart/form-data` with field `file` (audio file).

**Response:** JSON with `acoustic_features`, `baseline_comparison`, `lexical_analysis`, `risk_scores`, `explanation`, and `recommendations`.

---

## 🔧 Environment Variables

Copy `.env.example` to `.env` and fill in values as needed:

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Backend URL (default: `http://localhost:8000`) |
| `FEATHERLESS_API_KEY` | Placeholder for Featherless LLM API |
| `ELEVENLABS_API_KEY` | Placeholder for ElevenLabs API |
| `OPENAI_API_KEY` | Placeholder for OpenAI Whisper |

---

## 📜 License

For research and demonstration purposes only. Not a medical device.
