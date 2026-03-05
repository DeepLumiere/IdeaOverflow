import asyncio
import tempfile
import os
import shutil


async def generate_pdf(latex_code: str, timeout: int = 15):
    """Compiles LaTeX asynchronously with strict timeouts."""
    temp_dir = tempfile.mkdtemp()
    tex_file_path = os.path.join(temp_dir, 'main.tex')

    with open(tex_file_path, 'w', encoding='utf-8') as f:
        f.write(latex_code)

    # latexmk flags: -pdf (generate pdf), -interaction=nonstopmode (don't prompt on errors),
    # -halt-on-error (stop if fatal), -file-line-error (C-style error output)
    process = await asyncio.create_subprocess_exec(
        'latexmk', '-pdf', '-interaction=nonstopmode', '-halt-on-error', '-file-line-error', 'main.tex',
        cwd=temp_dir,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE
    )

    try:
        await asyncio.wait_for(process.communicate(), timeout=timeout)
    except asyncio.TimeoutError:
        process.kill()
        cleanup_temp_dir(temp_dir)
        raise Exception("LaTeX compilation timed out. Possible infinite loop in code.")

    pdf_path = os.path.join(temp_dir, 'main.pdf')
    if process.returncode != 0 or not os.path.exists(pdf_path):
        # In a full system, you would parse stderr and return specific line errors
        return None, temp_dir

    return pdf_path, temp_dir


def cleanup_temp_dir(temp_dir: str):
    """Ensures no disk space leaks."""
    if os.path.exists(temp_dir):
        shutil.rmtree(temp_dir, ignore_errors=True)