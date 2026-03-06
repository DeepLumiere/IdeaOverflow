
---

# Complete Workflow for Agent

## 1. Input Document Processing

The system receives a research paper file.

Supported formats:

```
PDF
DOCX
TXT
MD
```

Processing flow:

```
Upload File
↓
Text Extraction
↓
Text Cleaning
↓
Section Detection
↓
AST Creation
```

The AST should look like:

```json
{
  "title": "...",
  "abstract": "...",
  "keywords": [],
  "authors": [],
  "sections": []
}
```

---

# 2. Convert AST to Schema JSON

Transform the AST into the **final JSON structure required by the Typst template**.

Mapping:

```
AST.title → title
AST.abstract → abstract
AST.keywords → index_terms
AST.authors → authors
AST.sections → sections
```

Expected JSON format:

```json
{
  "title": "...",
  "abstract": "...",
  "index_terms": [],
  "authors": [],
  "sections": [
    {
      "heading": "Introduction",
      "content": "..."
    }
  ]
}
```

---

# 3. Save Output JSON

After generating the structured JSON:

Save the result to a file:

```
response.json
```

Implementation logic:

```
Generate JSON
↓
Validate schema
↓
Save response.json
```

Example code logic:

```
open("response.json", "w")
write(json_data)
```

This file will be used later for generating the PDF.

---

# 4. Project Folder Structure

The system should follow this structure:

```
project/
│
├── parser.py
├── ai_cleaner.py
├── ast_compiler.py
├── app.py
│
├── response.json
│
├── typst/
│   │
│   ├── single-column.typ
│   ├── double-column.typ
│   │
│   └── templates/
│        ├── ieee.typ
│        ├── acm.typ
│        ├── springer.typ
│        └── elsevier.typ
```

Explanation:

| File              | Purpose                                        |
| ----------------- | ---------------------------------------------- |
| single-column.typ | Base template for single column papers         |
| double-column.typ | Base template for two-column conference papers |
| templates folder  | Conference-specific formatting                 |

---

# 5. Convert JSON to Typst Content

Load the generated JSON:

```
response.json
```

Then insert its data into the Typst template.

Example logic:

```
title → document title
abstract → abstract block
authors → author block
sections → section headings and content
```

Example Typst generation:

```
= Introduction
content...

= Methodology
content...
```

---

# 6. Select Layout Template

The system should choose the layout based on the conference.

```
Conference Template
↓
Select base layout
```

Example:

| Conference | Layout            |
| ---------- | ----------------- |
| IEEE       | double-column.typ |
| ACM        | double-column.typ |
| Springer   | single-column.typ |

---

# 7. Generate Typst File

Using the selected template, generate a Typst file:

```
paper.typ
```

This file contains:

```
template import
title
authors
abstract
sections
references
```

---

# 8. Compile Typst to PDF

Run the Typst compiler:

```
typst compile paper.typ output.pdf
```

Output:

```
output.pdf
```

This PDF should follow the **journal/conference layout**.

---

# 9. Final Pipeline

```
Upload Document
↓
Text Extraction
↓
Text Cleaning
↓
Section Detection
↓
AST Creation
↓
Convert AST → JSON Schema
↓
Save response.json
↓
Load Typst Template
↓
Generate paper.typ
↓
Compile Typst
↓
Final Conference-style PDF
```

---

# Important Requirements for the Agent

The system must:

* correctly detect **sections and subsections**
* produce **structured JSON**
* save JSON in **response.json**
* use **Typst templates for formatting**
* generate **conference-style PDFs**

---

