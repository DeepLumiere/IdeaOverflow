"""
Typst Compilation Module
========================
Compiles a generated .typ file to PDF using the Typst CLI.

Usage:
    result = await compile_typst(output_dir)
    # result["pdf_path"] => path to compiled PDF
"""

import asyncio
import os


async def compile_typst(output_dir: str, filename: str = "paper.typ", timeout: int = 30):
    """
    Compile a Typst file to PDF.

    Args:
        output_dir: Directory containing the .typ file and template files.
        filename:   Name of the .typ entry file (default: paper.typ).
        timeout:    Maximum compilation time in seconds.

    Returns:
        dict with status, pdf_path (on success), or error (on failure).
    """
    typ_path = os.path.join(output_dir, filename)
    if not os.path.exists(typ_path):
        return {"status": "error", "error": f"Typst source not found: {filename}"}

    pdf_name = os.path.splitext(filename)[0] + ".pdf"
    pdf_path = os.path.join(output_dir, pdf_name)

    process = await asyncio.create_subprocess_exec(
        "typst", "compile", filename,
        cwd=output_dir,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
    )

    try:
        stdout, stderr = await asyncio.wait_for(process.communicate(), timeout=timeout)
    except asyncio.TimeoutError:
        process.kill()
        return {"status": "error", "error": "Typst compilation timed out."}

    if process.returncode != 0 or not os.path.exists(pdf_path):
        err_msg = stderr.decode(errors="replace").strip() if stderr else "Unknown compilation error"
        return {"status": "error", "error": err_msg}

    return {"status": "success", "pdf_path": pdf_path}
