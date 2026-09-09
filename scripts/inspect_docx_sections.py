from pathlib import Path

from docx import Document


docx_path = Path(r"C:/Users/Thodoris/Downloads/αναφορά - 3 (1) - ενημερωμένο.docx")
doc = Document(docx_path)
terms = ("ΠΑΡΑΡΤΗΜΑ Δ", "Stripe", "serverless", "MACH", "Payment", "πληρω")

for i, paragraph in enumerate(doc.paragraphs):
    text = paragraph.text.strip()
    if text and any(term.lower() in text.lower() for term in terms):
        print(i, repr(paragraph.style.name), text[:260])
