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
import shutil


BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def _find_typst() -> str:
    """Resolve the full path to the typst executable."""
    # 1. Check the project's local typst/ directory first
    local_exe = os.path.join(BASE_DIR, "typst", "typst.exe")
    if os.path.isfile(local_exe):
        return local_exe
    # Also check without .exe for Linux/Mac
    local_bin = os.path.join(BASE_DIR, "typst", "typst")
    if os.path.isfile(local_bin):
        return local_bin

    # 2. Try the current process PATH
    found = shutil.which("typst")
    if found:
        return found

    # 3. Refresh PATH from system environment (Windows-specific)
    try:
        import winreg
        with winreg.OpenKey(winreg.HKEY_CURRENT_USER, r"Environment") as key:
            user_path = winreg.QueryValueEx(key, "Path")[0]
        with winreg.OpenKey(
            winreg.HKEY_LOCAL_MACHINE,
            r"SYSTEM\CurrentControlSet\Control\Session Manager\Environment",
        ) as key:
            sys_path = winreg.QueryValueEx(key, "Path")[0]
        refreshed = sys_path + ";" + user_path
        found = shutil.which("typst", path=refreshed)
        if found:
            return found
    except (OSError, ImportError):
        pass

    raise FileNotFoundError(
        "Typst CLI not found. Install it: https://github.com/typst/typst"
    )

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

    typst_bin = _find_typst()

    # Use synchronous subprocess.run wrapped in asyncio.to_thread to avoid
    # NotImplementedError from asyncio.create_subprocess_exec on Windows
    import subprocess

    def _run():
        return subprocess.run(
            [typst_bin, "compile", filename],
            cwd=output_dir,
            capture_output=True,
            timeout=timeout,
        )

    try:
        result = await asyncio.to_thread(_run)
    except subprocess.TimeoutExpired:
        return {"status": "error", "error": "Typst compilation timed out."}

    if result.returncode != 0 or not os.path.exists(pdf_path):
        err_msg = result.stderr.decode(errors="replace").strip() if result.stderr else "Unknown compilation error"
        return {"status": "error", "error": err_msg}

    return {"status": "success", "pdf_path": pdf_path}
