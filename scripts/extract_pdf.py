#!/usr/bin/env python3
import sys
from pathlib import Path

def extract(path: Path) -> None:
    print(f"\n{'='*60}\n{path.name}\n{'='*60}")
    try:
        from pypdf import PdfReader
    except ImportError:
        try:
            from PyPDF2 import PdfReader
        except ImportError:
            print("Instala pypdf: pip install pypdf")
            sys.exit(1)
    reader = PdfReader(str(path))
    for i, page in enumerate(reader.pages, 1):
        text = page.extract_text() or ""
        print(f"\n--- Página {i} ---\n{text}")

if __name__ == "__main__":
    base = Path("/mnt/c/Users/yilgr/OneDrive/Desktop/supermarket/docs")
    for name in ["examen final  codific.pdf", "examen final.pdf"]:
        p = base / name
        if p.exists():
            extract(p)
        else:
            print(f"No encontrado: {p}")
