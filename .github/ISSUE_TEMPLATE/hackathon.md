# AI Manuscript Formatter – Frontend

Frontend interface for the AI Manuscript Formatting Agent built for HackaMined 2026.

The platform allows researchers to upload manuscripts and automatically format them according to conference or journal guidelines.

The interface provides a clean editing environment similar to Overleaf, where users can view formatting suggestions, edit LaTeX code, and preview the formatted manuscript.

---

# Features

Clean SaaS-style UI inspired by modern academic tools.

Upload research manuscripts.

Select conference or journal formatting guidelines.

Three-panel editor interface:

* Formatting suggestions panel
* LaTeX editing panel
* Formatted manuscript preview

Download a submission-ready formatted document.

---

# UI Workflow

Login
↓
Upload manuscript
↓
Select conference or journal
↓
View formatting suggestions
↓
Edit manuscript in LaTeX editor
↓
Preview formatted document
↓
Download final manuscript

---

# Editor Layout

The main editor page uses a three-panel interface:

Left Panel
Displays formatting issues and suggested corrections.

Middle Panel
LaTeX code editor where users can modify the manuscript.

Right Panel
Live preview of the manuscript formatted according to the selected conference guidelines.

---

# Tech Stack

Framework
Next.js

Styling
Tailwind CSS

UI Components
shadcn/ui

Code Editor
Monaco Editor

Deployment
Vercel

---

# Installation

Clone the repository

git clone https://github.com/your-repo/frontend.git

Navigate to project folder

cd frontend

Install dependencies

npm install

Run development server

npm run dev

---

# Project Structure

frontend/

components/

Navbar
UploadBox
ConferenceList
ChangesPanel
LatexEditor
PreviewPanel
Footer

pages/

login
dashboard
editor

styles/

---

# Deployment

This project can be easily deployed using Vercel.

1. Push the repository to GitHub.
2. Import the project into Vercel.
3. Deploy instantly.

---

# About

This project was built during HackaMined 2026 to automate academic manuscript formatting.

The goal is to reduce the time researchers spend manually formatting manuscripts and ensure compliance with journal or conference submission guidelines.
