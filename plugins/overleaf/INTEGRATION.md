# IdeaOverflow Plugin Integration Guide

## Overview
This plugin adds AI features directly into Overleaf's editor interface:
- 💬 **Chat** with document context
- ✏️ **Edit/Rewrite** selected text
- 📋 **Review** full document structure
- ✨ **Autocomplete** suggestions (press Tab)

## Integration Steps

### Step 1: Install Backend Dependencies
```powershell
# Activate virtual environment
.\venv\Scripts\activate

# Install requirements (if not already done)
pip install -r requirements.txt
```

### Step 2: Set Up API Key
Create a `.env` file in the `plugins/overleaf/` directory:
```
GEMINI_API_KEY=your_actual_gemini_api_key_here
```

**Important:** Remove hardcoded API keys from `ai_assistant.py` after setting up `.env`.

### Step 3: Start Plugin Backend
```powershell
# From project root
python -m uvicorn plugins.overleaf.main:app --reload --port 8000
```

The backend will run at `http://localhost:8000`

### Step 4: Load Chrome Extension

1. **Open Chrome** and go to: `chrome://extensions/`
2. **Enable Developer Mode** (toggle in top-right corner)
3. Click **"Load unpacked"**
4. Navigate to and select: `C:\Users\MAN PATEL\OneDrive\Desktop\IdeaOverflow\plugins\overleaf`
5. The extension should appear in your extensions list

### Step 5: Use on Overleaf

1. Go to https://www.overleaf.com
2. Open any LaTeX project
3. Look for the **✦ button** on the right side (appears after 3 seconds)
4. Click it to open the AI sidebar

## Features Explained

### Chat Tab
- Type questions about your document
- AI reads your full LaTeX context
- Example: "Explain the methodology section"

### Edit Tab
1. Highlight text in Overleaf editor
2. Enter instructions (e.g., "Make more academic")
3. Click "✨ Rewrite Selection"
4. Get AI-revised version

### Review Tab
- Click "📋 Run Document Analysis"
- Get feedback on clarity, structure, methodology

### Autocomplete (Automatic)
- Type normally in editor
- After 1.2 seconds pause, AI suggests next sentence
- Press **Tab** to accept suggestion
- Press any other key to dismiss

## Troubleshooting

### Extension not appearing on Overleaf?
- Check console (F12) for JavaScript errors
- Verify extension is enabled in `chrome://extensions/`
- Hard refresh Overleaf page (Ctrl+Shift+R)

### "Failed to fetch" errors?
- Ensure backend is running (`http://localhost:8000`)
- Check CORS settings in `main.py`
- Verify firewall isn't blocking port 8000

### Backend crashes?
- Check terminal for Python errors
- Verify `GEMINI_API_KEY` is set correctly
- Check `requirements.txt` dependencies installed

## File Structure
```
plugins/overleaf/
├── manifest.json       # Chrome extension config
├── content.js          # Injected UI and logic
├── background.js       # HTTP bridge to backend
├── styles.css          # Sidebar styling
├── logo.svg            # Branding icon
├── main.py            # FastAPI backend
├── ai_assistant.py    # Gemini integration
└── config.py          # Configuration (unused currently)
```

## Development Tips

### Reload Extension After Changes
1. JavaScript changes: Go to `chrome://extensions/` → Click reload icon
2. Backend changes: Server auto-reloads with `--reload` flag

### View Logs
- **Frontend logs**: F12 console on Overleaf page
- **Backend logs**: Terminal running uvicorn

### Test Without Overleaf
Send direct HTTP requests to test backend:
```powershell
curl -X POST http://localhost:8000/chat `
  -H "Content-Type: application/json" `
  -d '{"latex_code":"\\section{Test}","query":"Summarize","action_type":"chat"}'
```

## Security Notes
⚠️ **Before deploying:**
- Move API key to environment variable
- Lock down CORS origins in production
- Never commit `.env` file to git
