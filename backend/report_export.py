import os
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib import colors

def generate_pdf_report(hospital_id, hospital_stats, top_claims, executive_summary):
    """
    Generates a structured PDF audit report using reportlab.platypus.
    """
    file_name = f"hospital_{hospital_id}_audit_report.pdf"
    file_path = os.path.join(os.getcwd(), file_name)
    
    doc = SimpleDocTemplate(file_path, pagesize=letter)
    styles = getSampleStyleSheet()
    
    title_style = styles['Heading1']
    title_style.alignment = 1 # Center alignment
    heading_style = styles['Heading2']
    normal_style = styles['Normal']
    
    elements = []
    
    # Title
    elements.append(Paragraph("Ayushman Bharat Fraud Audit Report", title_style))
    elements.append(Spacer(1, 12))
    
    # Date Generated
    date_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    elements.append(Paragraph(f"<b>Date Generated:</b> {date_str}", normal_style))
    elements.append(Spacer(1, 24))
    
    # Executive Summary
    elements.append(Paragraph("Executive Summary", heading_style))
    elements.append(Spacer(1, 12))
    elements.append(Paragraph(executive_summary, normal_style))
    elements.append(Spacer(1, 24))
    
    # Hospital Risk Metrics Table
    elements.append(Paragraph("Hospital Risk Metrics", heading_style))
    elements.append(Spacer(1, 12))
    
    metrics_data = [
        ["Metric", "Value"],
        ["Hospital ID", hospital_id],
        ["State", str(hospital_stats.get('state', 'N/A'))],
        ["Total Claims", str(hospital_stats.get('total_claims', 0))],
        ["Fraud Count", str(hospital_stats.get('fraud_count', 0))],
        ["Image Reuse Cases", str(hospital_stats.get('image_reuse_count', 0))],
        ["Average Risk Score", str(round(hospital_stats.get('avg_risk_score', 0), 2))],
        ["Risk Category", str(hospital_stats.get('risk_category', 'N/A'))]
    ]
    
    t = Table(metrics_data, colWidths=[200, 200])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
    ]))
    elements.append(t)
    elements.append(Spacer(1, 24))
    
    # Top 10 Suspicious Claims
    elements.append(Paragraph("Top 10 Suspicious Claims", heading_style))
    elements.append(Spacer(1, 12))
    
    claims_data = [["Claim ID", "Procedure", "Amount (Rs)", "Risk Score"]]
    for _, row in top_claims.head(10).iterrows():
        claims_data.append([
            str(row.get('claim_id', '')),
            str(row.get('procedure_code', '')),
            f"{row.get('claim_amount', 0):.2f}",
            str(row.get('risk_score', 0))
        ])
        
    t2 = Table(claims_data, colWidths=[120, 100, 100, 100])
    t2.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.darkblue),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.lightgrey),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
    ]))
    elements.append(t2)
    elements.append(Spacer(1, 24))
    
    # Recommendation Section
    elements.append(Paragraph("Recommendation Section", heading_style))
    elements.append(Spacer(1, 12))
    rec = (
        "Based on the anomaly patterns observed, it is strongly recommended that this hospital "
        "undergoes a comprehensive secondary audit. Focus should be placed on verifying the authenticity "
        "of submitted diagnostic images and cross-referencing patient records for duplicate billing."
    )
    elements.append(Paragraph(rec, normal_style))
    
    doc.build(elements)
    
    return file_path
