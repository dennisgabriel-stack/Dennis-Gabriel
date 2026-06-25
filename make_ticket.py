# -*- coding: utf-8 -*-
import qrcode
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader
import io

# ---------------------------------------------------------------
# Daten des Strafzettels
# ---------------------------------------------------------------
ort          = "Landschreibereistraße 2"
betrag       = "15,00 EUR"
verstoss_1   = "Blockierung einer Einfahrt"
verstoss_2   = "Halten/Parken im Parkverbot (Zeichen 286 StVO)"
datum        = "25.06.2026"
uhrzeit      = "14:32 Uhr"
vorgangsnr   = "PK-2026-0625-0147"

# Inhalt des QR-Codes (Zusammenfassung des Vorgangs)
qr_text = (
    "PARKVERSTOSS / STRAFZETTEL\n"
    f"Vorgangs-Nr.: {vorgangsnr}\n"
    f"Ort: {ort}\n"
    f"Datum/Zeit: {datum} {uhrzeit}\n"
    f"Verstoss 1: {verstoss_1}\n"
    f"Verstoss 2: {verstoss_2}\n"
    f"Betrag: {betrag}\n"
    "Zahlungsfrist: 14 Tage"
)

# QR-Code erzeugen
qr = qrcode.QRCode(version=None, error_correction=qrcode.constants.ERROR_CORRECT_M,
                   box_size=10, border=2)
qr.add_data(qr_text)
qr.make(fit=True)
qr_img = qr.make_image(fill_color="black", back_color="white").convert("RGB")
buf = io.BytesIO()
qr_img.save(buf, format="PNG")
buf.seek(0)
qr_reader = ImageReader(buf)

# ---------------------------------------------------------------
# PDF erzeugen
# ---------------------------------------------------------------
pdf_path = "/home/user/Dennis-Gabriel/Strafzettel_Landschreibereistrasse2.pdf"
c = canvas.Canvas(pdf_path, pagesize=A4)
W, H = A4

dark  = colors.HexColor("#1a1a1a")
gray  = colors.HexColor("#666666")
line  = colors.HexColor("#cccccc")
red   = colors.HexColor("#b00000")

# Kopfzeile / Banner
c.setFillColor(dark)
c.rect(0, H - 38*mm, W, 38*mm, fill=1, stroke=0)
c.setFillColor(colors.white)
c.setFont("Helvetica-Bold", 22)
c.drawString(20*mm, H - 20*mm, "VERWARNUNG / STRAFZETTEL")
c.setFont("Helvetica", 11)
c.drawString(20*mm, H - 28*mm, "Kontrolle des ruhenden Verkehrs")
c.setFont("Helvetica", 9)
c.drawRightString(W - 20*mm, H - 20*mm, f"Vorgangs-Nr.: {vorgangsnr}")
c.drawRightString(W - 20*mm, H - 25*mm, f"Ausgestellt: {datum}")

y = H - 52*mm

def label_value(label, value, y, value_color=dark, value_font=("Helvetica-Bold", 12)):
    c.setFillColor(gray)
    c.setFont("Helvetica", 9)
    c.drawString(20*mm, y, label.upper())
    c.setFillColor(value_color)
    c.setFont(*value_font)
    c.drawString(20*mm, y - 6*mm, value)
    return y - 14*mm

# Tatort
y = label_value("Tatort", ort, y)
# Datum / Uhrzeit
c.setFillColor(gray); c.setFont("Helvetica", 9)
c.drawString(20*mm, y, "DATUM"); c.drawString(80*mm, y, "UHRZEIT")
c.setFillColor(dark); c.setFont("Helvetica-Bold", 12)
c.drawString(20*mm, y - 6*mm, datum); c.drawString(80*mm, y - 6*mm, uhrzeit)
y -= 14*mm

# Trennlinie
c.setStrokeColor(line); c.setLineWidth(0.7)
c.line(20*mm, y, W - 20*mm, y)
y -= 10*mm

# Festgestellte Verstöße
c.setFillColor(gray); c.setFont("Helvetica", 9)
c.drawString(20*mm, y, "FESTGESTELLTE VERSTÖSSE")
y -= 7*mm
c.setFillColor(dark); c.setFont("Helvetica", 11)
c.drawString(24*mm, y, f"•  {verstoss_1}")
y -= 6.5*mm
c.drawString(24*mm, y, f"•  {verstoss_2}")
y -= 12*mm

# Betrag-Box
box_h = 22*mm
c.setFillColor(colors.HexColor("#f5f5f5"))
c.setStrokeColor(red); c.setLineWidth(1.2)
c.rect(20*mm, y - box_h, W - 40*mm, box_h, fill=1, stroke=1)
c.setFillColor(gray); c.setFont("Helvetica", 9)
c.drawString(26*mm, y - 7*mm, "ZU ZAHLENDER BETRAG")
c.setFillColor(red); c.setFont("Helvetica-Bold", 24)
c.drawString(26*mm, y - 17*mm, betrag)
c.setFillColor(gray); c.setFont("Helvetica", 9)
c.drawRightString(W - 26*mm, y - 12*mm, "Zahlungsfrist: 14 Tage ab Ausstellung")
y -= box_h + 14*mm

# QR-Code rechts
qr_size = 38*mm
qr_x = W - 20*mm - qr_size
qr_y = y - qr_size
c.drawImage(qr_reader, qr_x, qr_y, qr_size, qr_size)
c.setFillColor(gray); c.setFont("Helvetica", 8)
c.drawCentredString(qr_x + qr_size/2, qr_y - 5*mm, "Vorgangsdaten scannen")

# Hinweistext links
c.setFillColor(dark); c.setFont("Helvetica-Bold", 10)
c.drawString(20*mm, y - 4*mm, "Hinweis")
c.setFillColor(gray); c.setFont("Helvetica", 9)
hinweis = [
    "Bitte begleichen Sie den oben genannten Betrag",
    "innerhalb der Zahlungsfrist. Den QR-Code können",
    "Sie scannen, um alle Vorgangsdaten einzusehen.",
    "Bei Rückfragen geben Sie bitte die Vorgangs-Nr. an.",
]
ty = y - 11*mm
for ln in hinweis:
    c.drawString(20*mm, ty, ln); ty -= 5*mm

# Fußzeile
c.setStrokeColor(line); c.setLineWidth(0.7)
c.line(20*mm, 22*mm, W - 20*mm, 22*mm)
c.setFillColor(gray); c.setFont("Helvetica", 8)
c.drawString(20*mm, 17*mm, "Dieses Dokument wurde automatisch erstellt.")
c.drawRightString(W - 20*mm, 17*mm, f"Vorgangs-Nr.: {vorgangsnr}")

c.showPage()
c.save()
print("PDF erstellt:", pdf_path)
