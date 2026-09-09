from docx import Document


doc = Document(r"C:/Users/Thodoris/Downloads/αναφορά_4 (1).docx")

for start, end in [(318, 344), (589, 642)]:
    print(f"--- {start}-{end}")
    for i, paragraph in enumerate(doc.paragraphs[start:end], start):
        text = paragraph.text.strip()
        if text:
            print(i, repr(paragraph.style.name), text[:500])
