// ═══════════════════════════════════════════
//  IEEE Conference — Double-Column Template
// ═══════════════════════════════════════════

#let render(data) = {
  set document(title: data.title, author: data.authors.map(a => a.name))
  set page(paper: "us-letter", margin: (top: 0.75in, bottom: 1in, left: 0.625in, right: 0.625in))
  set text(font: "Times New Roman", size: 10pt)
  set par(justify: true, leading: 0.55em)
  set heading(numbering: "I.A.1.")
  set math.equation(numbering: "(1)")

  // IEEE heading styles
  show heading.where(level: 1): it => {
    v(0.8em)
    align(center, text(weight: "bold", size: 10pt, upper(it)))
    v(0.4em)
  }
  show heading.where(level: 2): it => {
    v(0.6em)
    text(weight: "bold", style: "italic", size: 10pt, it)
    v(0.3em)
  }
  show heading.where(level: 3): it => {
    v(0.4em)
    text(style: "italic", size: 10pt, it)
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

  // Title — full-width, centered, bold, 24pt
  align(center)[
    #block(text(weight: "bold", size: 24pt, eval(data.title, mode: "markup")))
    #v(1em)
    #grid(
      columns: calc.min(data.authors.len(), 3),
      gutter: 2em,
      ..data.authors.map(a => align(center)[
        #text(size: 11pt)[#eval(a.name, mode: "markup")] \
        #text(style: "italic", size: 9pt)[#eval(a.affiliation, mode: "markup")]
      ])
    )
  ]
  v(2em)

  // Begin two-column layout
  show: columns.with(2, gutter: 0.25in)

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

  // IEEE references — numbered in square brackets, 8pt
  if "references" in data and data.references.len() > 0 {
    v(2em)
    heading(level: 1, numbering: none)[References]
    set text(size: 8pt)
    let i = 1
    for ref in data.references {
      block[
        [#i] #eval(ref.citation, mode: "markup")
      ]
      i += 1
    }
  }
}
