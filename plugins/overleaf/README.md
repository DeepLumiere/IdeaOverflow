# Quick Start - Overleaf Plugin

## 1. Setup (One-time)

### Set API Key
```powershell
# Copy example env file
cp .env.example .env

# Edit .env and add your Gemini API key
# Get key from: https://ai.google.dev/
```

### Install Dependencies (if not done)
```powershell
.\venv\Scripts\activate
pip install -r requirements.txt
```

## 2. Start Backend

**Option A: Using startup script**
```powershell
.\start_plugin.bat
```

**Option B: Manual**
```powershell
.\venv\Scripts\activate
python -m uvicorn plugins.overleaf.main:app --reload --port 8000
```

You should see:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
```

## 3. Load Extension in Chrome

1. Open Chrome → `chrome://extensions/`
2. Enable **Developer mode** (top-right toggle)
3. Click **"Load unpacked"**
4. Select folder: `C:\Users\MAN PATEL\OneDrive\Desktop\IdeaOverflow\plugins\overleaf`
5. ✅ Extension loaded!

## 4. Use on Overleaf

1. Go to https://www.overleaf.com
2. Open any LaTeX project
3. Wait 3 seconds for UI to inject
4. Click **✦** button on right side
5. Use Chat, Edit, Review tabs or autocomplete!

## Troubleshooting

**Backend not starting?**
- Check if port 8000 is already in use
- Verify .env has valid `GEMINI_API_KEY`

**Extension not loading?**
- Check Chrome console (F12) for errors
- Verify all files are in `plugins/overleaf/` folder
- Make sure `manifest.json` exists

**AI not responding?**
- Check backend terminal for errors
- Verify backend is running on port 8000
- Check if API key is valid

## Development

After making code changes:
- **JS/CSS changes**: Reload extension in `chrome://extensions/`
- **Python changes**: Auto-reloads with `--reload` flag

See [INTEGRATION.md](INTEGRATION.md) for detailed documentation.
