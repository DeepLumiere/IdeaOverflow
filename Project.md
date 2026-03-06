Your current flow assumes **LaTeX generation**, which you already said you **are not using**. So the pipeline must be rewritten around **Typst** and **two template types**:

* **single-column Typst template**
* **double-column Typst template**

Below is the **correct rewritten architecture** for your system.

---

# 1. Input Layer

**Goal:** Accept the raw research document.

Supported formats for prototype:

* `.pdf`
* `.docx`
* `.txt`
* `.md`

Example input

```
upload paper.docx
```

System action

```
file → text extractor
```

Extraction tools

* PDF → `pdfminer` / `PyMuPDF`
* DOCX → `python-docx`
* Markdown → markdown parser

Output

```json
{
 "raw_text": "Deep Learning for OCR\n\nAbstract\nThis paper..."
}
```

---

# 2. Text Cleaning Layer

Raw documents contain formatting noise.

Common issues

* page numbers
* extra whitespace
* header/footer artifacts
* broken lines from PDF extraction

Cleaning operations

* remove page numbers
* merge broken sentences
* normalize headings
* remove duplicate whitespace

Example cleaned text

```
Deep Learning for OCR

Abstract
This paper studies...

Introduction
OCR systems...
```

Output

```json
{
 "clean_text": "..."
}
```

---

# 3. Section Detection Engine

Goal: identify the logical structure of the research paper.

Typical sections

```
Title
Authors
Abstract
Keywords
Introduction
Related Work
Methodology
Experiments
Results
Conclusion
References
```

Detection logic

### Rule-based detection

Regex patterns detect headings

```
/^(abstract|introduction|related work|method|results|conclusion)/i
```

### NLP fallback

If headings are unclear:

Example text

```
Previous research has explored...
```

Classifier prediction

```
RELATED_WORK
```

Output becomes a **structured document representation (AST)**.

```json
{
 "title": "...",
 "authors": ["..."],
 "abstract": "...",
 "sections": [
   {
     "heading": "Introduction",
     "content": "..."
   },
   {
     "heading": "Methodology",
     "content": "..."
   }
 ]
}
```

This structure is the **internal document model** used by the renderer.

---

# 4. Template Schema Library

Define templates for different conference formats.

Examples

```
IEEE
ACM
NeurIPS
Springer
Elsevier
```

Each template is implemented as a **Typst template file**.

Two layout variants are supported.

### Single-column template

Example `single_column.typ`

```typst
#set page(
  paper: "a4",
  margin: 1in,
  columns: 1
)

#set text(
  font: "Times New Roman",
  size: 11pt
)
```

### Double-column template

Example `double_column.typ`

```typst
#set page(
  paper: "a4",
  margin: 0.75in,
  columns: 2
)

#set text(
  font: "Times New Roman",
  size: 10pt
)
```

Each template defines:

* font
* margin
* column layout
* heading style
* numbering rules

---

# 5. Template Mapping Engine

Map the parsed document structure into the Typst template.

Mapping rules

```
document.title → template.title
document.authors → template.author block
document.abstract → template.abstract
document.sections → template.section layout
document.references → template.references
```

Example input

```
Introduction
OCR systems...
```

Generated Typst

```typst
= Introduction

OCR systems...
```

---

# 6. Citation Handling

References are extracted from the document model.

Example raw reference

```
Vaswani 2017 attention is all you need
```

Formatted reference (IEEE style)

```
[1] A. Vaswani et al., "Attention Is All You Need," NeurIPS, 2017.
```

Tools that may assist

* Crossref API
* Semantic Scholar
* citation parsing libraries

Output

```
formatted_references
```

These references are inserted into the Typst document.

---

# 7. Typst Document Generator

Instead of generating LaTeX, the system generates a **Typst file**.

Example generated `paper.typ`

```typst
#import "double_column.typ": paper

#paper(
  title: "Deep Learning for OCR",

  authors: (
    (name: "Deep Joshi", affiliation: "Nirma University")
  ),

  abstract: [
    This paper studies OCR systems.
  ],

  body: [
    = Introduction
    OCR systems are widely used.

    = Methodology
    We propose a CNN model.
  ]
)
```

The template file controls layout.

---

# 8. Typst Compilation

Compile Typst to PDF.

Command

```
typst compile paper.typ
```

Output

```
paper_formatted.pdf
```

---

# 9. Frontend Workflow

User interaction flow

```
1 Upload research paper
2 Select conference template
3 Choose layout (single-column / double-column)
4 Click Convert
5 Preview formatted paper
6 Download PDF
```

UI modules

```
File upload
Template selector
Layout selector
Preview panel
Download button
```

---

# 10. Complete System Pipeline

```
UPLOAD DOCUMENT
      │
      ▼
TEXT EXTRACTION
      │
      ▼
TEXT CLEANING
      │
      ▼
SECTION DETECTION
      │
      ▼
DOCUMENT STRUCTURE (AST)
      │
      ▼
TEMPLATE MAPPING
      │
      ▼
TYPST FILE GENERATION
      │
      ▼
TYPST COMPILATION
      │
      ▼
FORMATTED PDF OUTPUT
```

---

# Important Practical Note

For a **prototype**, simplify aggressively:

Avoid initially handling

* tables
* figures
* equations
* complex citations

Start with

```
DOCX → text
sections detected
Typst template applied
PDF generated
```

Once that works, add complexity later.
