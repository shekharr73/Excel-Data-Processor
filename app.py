import os
from flask import Flask, render_template, request, jsonify, send_from_directory
import pandas as pd
from datetime import datetime

app = Flask(__name__)
app.secret_key = 'your_secret_key_here'

PROCESSED_FOLDER = 'processed'
os.makedirs(PROCESSED_FOLDER, exist_ok=True)

REQUIRED_COLUMNS = [
    "Recipient's GSTIN",
    "Type of supply",
    "Taxable Value",
    "IGST",
    "CGST",
    "SGST/UTGST"
]
NUMERIC_COLUMNS = ["Taxable Value", "IGST", "CGST", "SGST/UTGST"]

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'success': False, 'error': 'No file part in request.'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'success': False, 'error': 'No file selected.'}), 400

    try:
        df = pd.read_excel(file, skiprows=6)
        df.columns = df.columns.str.strip()

        column_mapping = {
            'Recipients GSTIN': "Recipient's GSTIN",
            'Type of supply': 'Type of supply',
            'Taxable Value (Rs.)': 'Taxable Value',
            'IGST \n(Rs.)': 'IGST',
            'CGST \n(Rs.)': 'CGST',
            'SGST/UTGST \n(Rs.)': 'SGST/UTGST'
        }
        df.rename(columns=column_mapping, inplace=True)

        missing_cols = [col for col in REQUIRED_COLUMNS if col not in df.columns]
        if missing_cols:
            return jsonify({'success': False, 'error': f'Missing required columns: {", ".join(missing_cols)}'}), 400

        df = df[REQUIRED_COLUMNS].copy()
        df.dropna(subset=["Recipient's GSTIN"], inplace=True)
        df = df[df["Recipient's GSTIN"].astype(str).str.len() == 15]
        for col in NUMERIC_COLUMNS:
            df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0)

        summary = df.groupby('Type of supply')[NUMERIC_COLUMNS].sum().reset_index()

        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_filename = f"processed_summary_{timestamp}.xlsx"
        output_path = os.path.join(PROCESSED_FOLDER, output_filename)

        with pd.ExcelWriter(output_path, engine='openpyxl') as writer:
            summary.to_excel(writer, index=False, sheet_name='Summary')
            worksheet = writer.sheets['Summary']
            for column in worksheet.columns:
                max_length = max(len(str(cell.value)) if cell.value else 0 for cell in column)
                column_letter = column[0].column_letter
                worksheet.column_dimensions[column_letter].width = max_length + 2

        return jsonify({'success': True, 'download_url': f'/download/{output_filename}', 'filename': output_filename})

    except Exception as e:
        return jsonify({'success': False, 'error': f'An error occurred: {str(e)}'}), 500

@app.route('/download/<filename>')
def download_file(filename):
    return send_from_directory(PROCESSED_FOLDER, filename, as_attachment=True)

if __name__ == '__main__':
    app.run(debug=True)
