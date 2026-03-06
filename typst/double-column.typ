#let render-double-column(data) = {
  // Document settings
  set document(title: data.title, author: data.authors.map(a => a.name))
  set page(paper: "a4", margin: 1in)
  set text(font: "New Computer Modern", size: 10pt) // Slightly smaller font for double-column
  set par(justify: true, leading: 0.55em)
  set heading(numbering: "1.1.")
  set math.equation(numbering: "(1)")

  // Helper function to replace @IDs with dynamic numbers
  let process-text(text-str) = {
    let resolved-str = text-str
    if "references" in data {
      let i = 1
      for ref in data.references {
        resolved-str = resolved-str.replace("@" + ref.id, str(i))
        i += 1
      }
    }
    eval(resolved-str, mode: "markup")
  }

  // Title and Authors (Spanning both columns)
  align(center)[
    #block(text(weight: "bold", size: 17pt, eval(data.title, mode: "markup")))
    #v(1em)
    #grid(
      columns: data.authors.len(),
      gutter: 2em,
      ..data.authors.map(a => align(center)[
        *#eval(a.name, mode: "markup")* \
        _#eval(a.affiliation, mode: "markup")_
      ])
    )
  ]
  v(2em)

  // Start two-column layout for the body content
  show: columns.with(2, gutter: 1.5em)

  // ---------------------------------------------------------
  // THE RECURSIVE ENGINE (Hierarchical Parsing)
  // ---------------------------------------------------------
  let render-blocks(blocks) = {
    for item in blocks {
      if item.type == "section" {
        heading(level: 1)[#eval(item.title, mode: "markup")]
        if "content" in item { render-blocks(item.content) } // <-- Recursion!

      } else if item.type == "subsection" {
        heading(level: 2)[#eval(item.title, mode: "markup")]
        if "content" in item { render-blocks(item.content) } // <-- Recursion!

      } else if item.type == "subsubsection" {
        heading(level: 3)[#eval(item.title, mode: "markup")]
        if "content" in item { render-blocks(item.content) } // <-- Recursion!

      } else if item.type == "paragraph" {
        process-text(item.text)

      } else if item.type == "equation" {
        math.equation(block: true, eval(item.math, mode: "math"))

      } else if item.type == "image" {
        let img-width = auto
        if "width" in item {
          img-width = eval(item.width)
        }
        let img-caption = none
        if "caption" in item {
          img-caption = eval(item.caption, mode: "markup")
        }
        figure(
          image(item.src, width: img-width),
          caption: img-caption
        )

      } else if item.type == "table" {
        let table-cells = ()
        if "headers" in item {
          for h in item.headers {
            table-cells.push([*#eval(h, mode: "markup")*])
          }
        }
        if "data" in item {
          for row in item.data {
            for cell in row {
              table-cells.push(eval(cell, mode: "markup"))
            }
          }
        }
        let t = table(
          columns: item.columns,
          align: center + horizon,
          ..table-cells
        )
        if "caption" in item {
          figure(t, caption: eval(item.caption, mode: "markup"), kind: table)
        } else {
          t
        }
      }
    }
  }

  // Trigger the recursive engine on the root content array
  if "content" in data {
    render-blocks(data.content)
  }

  // ---------------------------------------------------------
  // REFERENCES
  // ---------------------------------------------------------
  if "references" in data and data.references.len() > 0 {
    v(1.5em)
    heading(level: 1, numbering: none)[References]

    // Count dynamically from 1 to N
    let i = 1
    for ref in data.references {
      block[
        [#i] #eval(ref.citation, mode: "markup")
      ]
      i += 1
    }
  }
}

// -----------------------------------------
// USAGE:
// Load the JSON and call the template function.
// -----------------------------------------
#let paper-data = json("paper.json")
#render-double-column(paper-data)