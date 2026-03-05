from TexSoup import TexSoup
def extract_ast(latex_code: str) -> dict:
    """Safely extracts document structure. Uses try/except per node to prevent complete failure."""
    try:
        soup = TexSoup(latex_code)
    except Exception as e:
        raise ValueError(f"Fatal LaTeX structure error: {str(e)}")

    ast = {
        "metadata": {"title": None, "author": None, "packages": []},
        "structure": {"sections": [], "subsections": [], "appendix": False},
        "environments": {"equations": [], "figures": [], "tables": [], "lists": []},
        "references": []
    }

    # Metadata
    if soup.title: ast["metadata"]["title"] = str(soup.title.string)
    if soup.author: ast["metadata"]["author"] = str(soup.author.string)
    ast["metadata"]["packages"] = [str(pkg.string) for pkg in soup.find_all('usepackage')]

    # Structure
    for sec in soup.find_all('section'):
        ast["structure"]["sections"].append(str(sec.string))
    for subsec in soup.find_all('subsection'):
        ast["structure"]["subsections"].append(str(subsec.string))
    if soup.find('appendix'):
        ast["structure"]["appendix"] = True

    # Environments
    for eq in soup.find_all('equation'):
        ast["environments"]["equations"].append(str(eq))
    for fig in soup.find_all('figure'):
        ast["environments"]["figures"].append(str(fig))
    for tab in soup.find_all('table'):
        ast["environments"]["tables"].append(str(tab))
    for itemize in soup.find_all('itemize'):
         ast["environments"]["lists"].append(str(itemize))

    # References (assuming bibtex \cite or \bibitem)
    ast["references"] = [str(ref.string) for ref in soup.find_all('cite')]

    return ast