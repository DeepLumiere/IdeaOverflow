// ═══════════════════════════════════════════
//  NeurIPS Conference — Single-Column Template
// ═══════════════════════════════════════════

#let render(data) = {
  set document(title: data.title, author: data.authors.map(a => a.name))
  set page(paper: "us-letter", margin: (top: 1in, bottom: 1in, left: 1.5in, right: 1.5in))
  set text(font: "Times New Roman", size: 10pt)
  set par(justify: true, leading: 0.55em)
  set heading(numbering: "1.1.1")
  set math.equation(numbering: "(1)")

  // NeurIPS heading styles — bold, left-aligned
  show heading.where(level: 1): it => {
    v(1em)
    text(weight: "bold", size: 12pt, it)
    v(0.5em)
  }
  show heading.where(level: 2): it => {
    v(0.8em)
    text(weight: "bold", size: 10pt, it)
    v(0.3em)
  }
  show heading.where(level: 3): it => {
    v(0.6em)
    text(weight: "bold", style: "italic", size: 10pt, it)
    v(0.2em)
  }

  // Reference citation helper
  let process-text(text-str) = {
    let resolved-str = text-str
    if "references" in data {
      let i = 1
      for ref in data.references {
        resolved-str = resolved-str.replace("@" + ref.id, "[" + str(i) + "]")
        i += 1
      }
    }
    eval(resolved-str, mode: "markup")
  }

  // Title — centered, bold, 17pt
  align(center)[
    #block(text(weight: "bold", size: 17pt, eval(data.title, mode: "markup")))
    #v(1.5em)
    #grid(
      columns: calc.min(data.authors.len(), 3),
      gutter: 2em,
      ..data.authors.map(a => align(center)[
        #text(weight: "bold", size: 10pt)[#eval(a.name, mode: "markup")] \
        #text(size: 9pt)[#eval(a.affiliation, mode: "markup")]
      ])
    )
  ]
  v(2em)

  // Recursive block renderer
  let render-blocks(blocks) = {
    for item in blocks {
      if item.type == "section" {
        heading(level: 1)[#eval(item.title, mode: "markup")]
        if "content" in item { render-blocks(item.content) }
      } else if item.type == "subsection" {
        heading(level: 2)[#eval(item.title, mode: "markup")]
        if "content" in item { render-blocks(item.content) }
      } else if item.type == "subsubsection" {
        heading(level: 3)[#eval(item.title, mode: "markup")]
        if "content" in item { render-blocks(item.content) }
      } else if item.type == "paragraph" {
        process-text(item.text)
      } else if item.type == "equation" {
        math.equation(block: true, eval(item.math, mode: "math"))
      } else if item.type == "image" {
        let img-width = auto
        if "width" in item { img-width = eval(item.width) }
        let img-caption = none
        if "caption" in item { img-caption = eval(item.caption, mode: "markup") }
        figure(image(item.src, width: img-width), caption: img-caption)
      } else if item.type == "table" {
        let table-cells = ()
        if "headers" in item {
          for h in item.headers { table-cells.push([*#eval(h, mode: "markup")*]) }
        }
        if "data" in item {
          for row in item.data {
            for cell in row { table-cells.push(eval(cell, mode: "markup")) }
          }
        }
        let t = table(columns: item.columns, align: center + horizon, ..table-cells)
        if "caption" in item {
          figure(t, caption: eval(item.caption, mode: "markup"), kind: table)
        } else { t }
      }
    }
  }

  if "content" in data { render-blocks(data.content) }

  // NeurIPS references
  if "references" in data and data.references.len() > 0 {
    v(2em)
    heading(level: 1, numbering: none)[References]
    set text(size: 9pt)
    let i = 1
    for ref in data.references {
      block(spacing: 0.5em)[
        [#i] #eval(ref.citation, mode: "markup")
      ]
      i += 1
    }
  }
}
