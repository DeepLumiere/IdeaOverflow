# JSON-Driven Academic Paper Editor

A modern, three-pane web application for academic writing where the "Source of Truth" is a structured JSON object instead of LaTeX. The UI reacts in real-time to changes in the JSON data.

## Architecture Overview

### Key Features

1. **Three-Pane Editor Layout**
   - **Left Sidebar**: Global Actions + Document Outline
   - **Middle Pane**: Monaco JSON Editor with syntax highlighting
   - **Right Pane**: Live Preview (White A4 paper style)

2. **Real-Time Synchronization**
   - Edit JSON in the middle pane
   - Preview updates instantly in the right pane
   - Changes are automatically saved with timestamp

3. **Conference Templates**
   - IEEE (Two-column layout)
   - ACM SIGCONF
   - Nature Publishing
   - Springer (LNCS format)
   - ArXiv Preprints
   - ICLR

4. **Global Actions**
   - Add New Section
   - Add Author
   - Insert Table
   - Add Reference

### Project Structure

```
frontend/
├── pages/
│   ├── dashboard.tsx         # Main dashboard with template selection
│   ├── workspace.tsx         # Three-pane editor workspace
│   ├── editor.tsx            # Legacy LaTeX editor
│   ├── login.tsx
│   └── index.tsx
├── components/
│   ├── workspace/
│   │   ├── LeftSidebar.tsx   # Actions + Document outline
│   │   ├── JSONEditor.tsx    # Monaco JSON editor
│   │   ├── PreviewPane.tsx   # Live preview of paper
│   │   └── WorkspaceFooter.tsx
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   └── ...
├── context/
│   ├── AuthContext.tsx       # Authentication state
│   ├── DocumentContext.tsx   # JSON document state
│   └── ManuscriptContext.tsx # Legacy manuscript management
├── types/
│   └── document.ts           # TypeScript interfaces for document structure
├── data/
│   └── conferences.ts        # Conference templates
└── styles/
    └── globals.css
```

## Data Structure

The core document structure is defined in `types/document.ts`:

```typescript
interface AcademicDocument {
  title: string;
  abstract: string;
  authors: Author[];
  keywords: string[];
  sections: Section[];
  references: Reference[];
  tables: Table[];
  conference: string;
  createdAt: string;
  updatedAt: string;
}
```

## How to Use

### Start New Paper
1. Go to Dashboard
2. Select a conference template (IEEE, ACM, Nature, etc.)
3. You'll be redirected to the Workspace

### Workspace Features
- **Left Sidebar**: Click buttons to add new sections, authors, references, or tables
- **Middle Pane**: Directly edit the JSON. Changes sync automatically
- **Right Pane**: See live preview of your paper in A4 format
- **Footer**: View sync status and document statistics

### Navigation
- **Dashboard**: Access from navbar
- **New Paper**: Click "New Paper" in navbar
- **Workspace**: Three-pane editor at `/workspace`
- **Legacy Editor**: Available at `/editor` for LaTeX-based manuscripts

## Technologies Used

- **Next.js 14**: React framework with app routing
- **React 18**: UI library
- **TypeScript**: Type-safe code
- **Tailwind CSS**: Utility-first styling
- **Monaco Editor**: Professional code editing with syntax highlighting
- **Lucide React**: Icon library

## Running the Application

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
npm start
```

Visit `http://localhost:3000` in your browser.

## Key Files

| File | Purpose |
|------|---------|
| `context/DocumentContext.tsx` | Manages JSON document state and sync |
| `components/workspace/JSONEditor.tsx` | Monaco editor instance |
| `components/workspace/PreviewPane.tsx` | A4-style paper preview |
| `types/document.ts` | Document structure definitions |
| `data/conferences.ts` | Conference template metadata |

## Features Roadmap

- [ ] Export to PDF
- [ ] Collaborative editing
- [ ] Custom conference templates
- [ ] Auto-formatting on save
- [ ] Version history
- [ ] Comment/review system
- [ ] AI-powered writing suggestions
