from pathlib import Path

from docx import Document
from docx.enum.text import WD_BREAK
from docx.shared import Inches, Pt, RGBColor


SOURCE = Path(r"C:/Users/Thodoris/Downloads/αναφορά - 3 (1).docx")
OUTPUT = Path(r"C:/Users/Thodoris/Downloads/αναφορά - 3 (1) - ενημερωμένο.docx")


def set_run(run, bold=False, italic=False):
    run.font.name = "Arial"
    run.font.size = Pt(11)
    run.bold = bold
    run.italic = italic


def paragraph_after(paragraph, text="", style=None):
    new_p = paragraph.insert_paragraph_before(text)
    if style:
        new_p.style = style
    return new_p


def add_before(anchor, text="", style=None):
    paragraph = anchor.insert_paragraph_before(text)
    if style:
        paragraph.style = style
    return paragraph


def add_heading(anchor, text, level=1):
    style = f"Heading {level}"
    paragraph = add_before(anchor, text, style)
    for run in paragraph.runs:
        run.font.name = "Arial"
        run.font.color.rgb = RGBColor(31, 78, 121)
    return paragraph


def add_body(anchor, text):
    paragraph = add_before(anchor, text, "Normal")
    paragraph.paragraph_format.space_after = Pt(6)
    paragraph.paragraph_format.line_spacing = 1.15
    for run in paragraph.runs:
        set_run(run)
    return paragraph


def add_bullets(anchor, items):
    for item in items:
        paragraph = add_before(anchor, item, "List Bullet 2")
        paragraph.paragraph_format.space_after = Pt(3)
        for run in paragraph.runs:
            set_run(run)


def add_numbered(anchor, items):
    for item in items:
        paragraph = add_before(anchor, item, "List")
        paragraph.paragraph_format.space_after = Pt(3)
        for run in paragraph.runs:
            set_run(run)


def add_code_block(anchor, lines):
    for line in lines:
        paragraph = add_before(anchor, line, "Normal (Web)")
        paragraph.paragraph_format.space_after = Pt(0)
        for run in paragraph.runs:
            run.font.name = "Consolas"
            run.font.size = Pt(9)


def add_table(anchor, headers, rows):
    table = anchor._parent.add_table(rows=1, cols=len(headers), width=Inches(6.2))
    anchor._p.addprevious(table._tbl)
    table.style = "Table Grid"

    header_cells = table.rows[0].cells
    for index, header in enumerate(headers):
        header_cells[index].text = header
        for paragraph in header_cells[index].paragraphs:
            for run in paragraph.runs:
                set_run(run, bold=True)

    for row in rows:
        cells = table.add_row().cells
        for index, value in enumerate(row):
            cells[index].text = value
            for paragraph in cells[index].paragraphs:
                for run in paragraph.runs:
                    set_run(run)

    spacer = add_before(anchor, "")
    spacer.paragraph_format.space_after = Pt(6)


def main():
    doc = Document(SOURCE)

    anchor = None
    for paragraph in doc.paragraphs:
        if paragraph.text.strip().startswith("Υπεύθυνη Δήλωση Συγγραφέα"):
            anchor = paragraph
            break

    if anchor is None:
        anchor = doc.paragraphs[-1]

    page_break = add_before(anchor)
    page_break.add_run().add_break(WD_BREAK.PAGE)

    add_heading(anchor, "ΠΑΡΑΡΤΗΜΑ Δ – Τελευταίες επεκτάσεις και πειραματικές λειτουργίες", 1)
    add_body(
        anchor,
        "Το παρόν παράρτημα συγκεντρώνει τις πρόσφατες επεκτάσεις της πλατφόρμας ηλεκτρονικού "
        "καταστήματος, οι οποίες ενισχύουν τη λειτουργικότητα, την αξιολόγηση, την επεκτασιμότητα "
        "και τη σύνδεση της υλοποίησης με σύγχρονες αρχιτεκτονικές προσεγγίσεις.",
    )

    add_heading(anchor, "Δ.1 Βελτιώσεις προϊόντων, παραγγελιών και εμπειρίας χρήστη", 2)
    add_body(
        anchor,
        "Στο επίπεδο του υπάρχοντος συστήματος διορθώθηκαν λειτουργικά ζητήματα που επηρέαζαν "
        "την εμφάνιση προϊόντων, τη διαχείριση εικόνων και την ολοκλήρωση παραγγελιών. Επιπλέον, "
        "βελτιώθηκε η διεπαφή χρήστη του Next.js frontend, ώστε ο κατάλογος προϊόντων, το καλάθι "
        "και η σελίδα checkout να προσφέρουν πιο καθαρή και συνεπή εμπειρία χρήσης.",
    )
    add_bullets(
        anchor,
        [
            "Προσθήκη τυχαίων demo προϊόντων στο Strapi, με idempotent seed script και σωστή υποστήριξη draft/published rows.",
            "Διόρθωση προβλήματος όπου τα προϊόντα εμφανίζονταν στο REST API αλλά όχι στο Strapi Admin.",
            "Διόρθωση εμφάνισης εικόνων προϊόντων από Strapi uploads στο Next.js frontend.",
            "Διόρθωση δημιουργίας παραγγελίας με χρήση documentId ή numeric id και server-side υπολογισμό συνολικού ποσού.",
            "Βελτίωση καταλόγου προϊόντων με αναζήτηση, ταξινόμηση, φίλτρα διαθεσιμότητας και πιο καθαρή κάρτα προϊόντος.",
        ],
    )

    add_heading(anchor, "Δ.2 Πειραματικός AI recommender και A/B testing", 2)
    add_body(
        anchor,
        "Προστέθηκε πειραματική λειτουργία προτάσεων προϊόντων, η οποία υλοποιεί item/session based "
        "collaborative filtering. Όταν δεν υπάρχουν επαρκή δεδομένα αλληλεπίδρασης, το σύστημα "
        "χρησιμοποιεί fallback σε προϊόντα ίδιας κατηγορίας, δημοφιλή ή πρόσφατα προϊόντα. Παράλληλα, "
        "ενσωματώθηκε A/B testing για την αξιολόγηση διαφορετικών παραλλαγών παρουσίασης των προτάσεων.",
    )
    add_table(
        anchor,
        ["Στοιχείο", "Περιγραφή"],
        [
            ["Interaction tracking", "Καταγραφή view, add_to_cart, purchase, recommendation_impression και recommendation_click events."],
            ["A/B variant", "Ανάθεση παραλλαγής A ή B ανά session μέσω browser storage."],
            ["Recommendation endpoint", "Νέο endpoint /api/recommendations για παραγωγή προτάσεων προϊόντων."],
            ["Evaluation metrics", "Υπολογισμός CTR προτάσεων, add-to-cart rate και conversion rate ανά variant."],
        ],
    )
    add_body(
        anchor,
        "Η λειτουργία αυτή επιτρέπει τη συλλογή πειραματικών δεδομένων UX και τη σύγκριση της "
        "αποτελεσματικότητας διαφορετικών τρόπων εμφάνισης των προτεινόμενων προϊόντων.",
    )

    add_heading(anchor, "Δ.3 Μετρική αξιολόγηση απόδοσης και ασφάλειας", 2)
    add_body(
        anchor,
        "Για την ποσοτική αξιολόγηση της πλατφόρμας προστέθηκε ανεξάρτητο evaluation toolkit, το "
        "οποίο εκτελεί επαναλαμβανόμενες μετρήσεις και παράγει αναφορές σε JSON και Markdown. "
        "Οι μετρήσεις προβάλλονται και στη σελίδα /evaluation του frontend.",
    )
    add_bullets(
        anchor,
        [
            "Μέτρηση Time-to-First-Byte (TTFB) για βασικές σελίδες του Next.js frontend.",
            "Μέτρηση latency για Strapi API endpoints, όπως products, recommendations και interaction summary.",
            "Έλεγχος βασικών HTTP security headers για frontend και Strapi API.",
            "Έλεγχος προστατευμένου endpoint παραγγελιών χωρίς JWT token.",
            "Παραγωγή συγκριτικής μελέτης έναντι παραδοσιακού monolithic CMS.",
        ],
    )
    add_code_block(
        anchor,
        [
            "npm run evaluate",
            "evaluation/reports/latest.json",
            "evaluation/reports/summary.md",
        ],
    )

    add_heading(anchor, "Δ.4 Ενδεικτική serverless και composable αρχιτεκτονική", 2)
    add_body(
        anchor,
        "Ως απόδειξη δυνατότητας μετάβασης σε composable/MACH αρχιτεκτονική, δημιουργήθηκε φάκελος "
        "serverless με ανεξάρτητα function-style services. Τα services μπορούν να λειτουργήσουν τοπικά "
        "μέσω adapter, αλλά έχουν δομή συμβατή με μελλοντική μεταφορά σε AWS Lambda, Azure Functions "
        "ή παρόμοια serverless περιβάλλοντα.",
    )
    add_table(
        anchor,
        ["Microservice", "Ρόλος", "Endpoint τοπικού adapter"],
        [
            ["recommendations", "Αυτόνομη υπηρεσία προτάσεων προϊόντων", "GET /recommendations"],
            ["analytics", "Αυτόνομη καταγραφή interaction events", "POST /track"],
            ["checkout", "Αυτόνομη ενορχήστρωση checkout με JWT forwarding", "POST /checkout"],
        ],
    )
    add_body(
        anchor,
        "Το frontend υποστηρίζει δύο τρόπους λειτουργίας. Αν υπάρχουν οι αντίστοιχες μεταβλητές "
        "περιβάλλοντος, χρησιμοποιεί τα serverless endpoints. Αν δεν υπάρχουν, συνεχίζει να χρησιμοποιεί "
        "τα υπάρχοντα Strapi endpoints, διατηρώντας πλήρη συμβατότητα.",
    )
    add_code_block(
        anchor,
        [
            "NEXT_PUBLIC_RECOMMENDATIONS_URL=http://127.0.0.1:8787/recommendations",
            "NEXT_PUBLIC_ANALYTICS_URL=http://127.0.0.1:8787/track",
            "NEXT_PUBLIC_CHECKOUT_URL=http://127.0.0.1:8787/checkout",
        ],
    )

    add_heading(anchor, "Δ.5 Αντιστοίχιση με αρχές MACH", 2)
    add_table(
        anchor,
        ["Αρχή MACH", "Υλοποίηση στην πλατφόρμα"],
        [
            ["Microservices", "Οι λειτουργίες recommender, analytics και checkout απομονώθηκαν ως ανεξάρτητα services."],
            ["API-first", "Η επικοινωνία γίνεται μέσω JSON/HTTP endpoints με σαφή contracts."],
            ["Cloud-native", "Οι handlers έχουν μορφή συμβατή με serverless functions και μπορούν να μεταφερθούν σε cloud runtime."],
            ["Headless", "Το Strapi παραμένει headless CMS, ενώ το Next.js παραμένει ανεξάρτητο frontend/PWA."],
        ],
    )

    add_heading(anchor, "Δ.6 Έλεγχοι επαλήθευσης", 2)
    add_body(
        anchor,
        "Μετά τις αλλαγές εκτελέστηκαν έλεγχοι ορθής λειτουργίας και παραγωγικής μεταγλώττισης. "
        "Οι βασικοί έλεγχοι περιλαμβάνουν linting, build του Next.js frontend, build του Strapi backend, "
        "API smoke tests για recommendations και interaction tracking, καθώς και browser check για την "
        "εμφάνιση του recommender και των μετρικών αξιολόγησης.",
    )
    add_bullets(
        anchor,
        [
            "npm run lint στο frontend.",
            "npm run build στο frontend.",
            "npm run build στο Strapi backend.",
            "Smoke test για /api/recommendations και /api/interactions/track.",
            "Smoke test για serverless /recommendations, /track και /checkout.",
            "Browser verification για /products/macbook-pro και /evaluation.",
        ],
    )

    doc.save(OUTPUT)
    print(OUTPUT)


if __name__ == "__main__":
    main()
