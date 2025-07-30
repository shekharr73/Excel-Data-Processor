# Excel Data Processor (Outward Supply)

This Flask web application allows users to upload an Excel file containing "Outward supply" data, processes it, and provides a summarized Excel file for download.

## Features

- **File Upload**: A clean, drag-and-drop interface to upload Excel files (`.xlsx`, `.xls`).
- **Data Preprocessing**:
  - Skips initial header rows in the Excel file (specifically, the first 6 rows).
  - Validates the presence of required columns: `"Recipient's GSTIN"`, `"Type of supply"`, `"Taxable Value"`, `"IGST"`, `"CGST"`, `"SGST/UTGST"`.
  - Filters out rows with invalid or missing GSTINs (keeps 15-character GSTINs).
- **Data Summarization**:
  - Groups the data by `"Type of supply"`.
  - Calculates the sum of `"Taxable Value"`, `"IGST"`, `"CGST"`, and `"SGST/UTGST"` for each group.
- **Output Generation**:
  - Generates a new, cleaned, and formatted Excel file with the summarized data.
  - The output file is styled to be clear and readable.
- **User-Friendly Interface**: Built with Bootstrap for a responsive and modern look. It provides clear feedback on success or errors.

## Project Structure

```
.
├── app.py              # Main Flask application
├── requirements.txt    # Python dependencies
├── templates/
│   └── index.html      # Frontend HTML page
├── uploads/            # Directory for storing uploaded files
└── processed/          # Directory for storing processed files
```

## Setup and Installation

1.  **Clone the repository or download the source code.**

2.  **Create a virtual environment (recommended):**
    ```bash
    python -m venv venv
    ```
    Activate the virtual environment:
    - On Windows:
      ```bash
      .\venv\Scripts\activate
      ```
    - On macOS/Linux:
      ```bash
      source venv/bin/activate
      ```

3.  **Install the required dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Create the necessary directories:**
    Make sure you have the `uploads` and `processed` directories in your project root.

## How to Run

1.  **Run the Flask application:**
    ```bash
    flask run
    ```
    Or, to run in debug mode:
    ```bash
    flask --app app --debug run
    ```

2.  **Open your web browser** and navigate to:
    [http://127.0.0.1:5000](http://127.0.0.1:5000)

## How to Use

1.  **Upload File**: Drag and drop your Excel file onto the upload area or click the "Choose File" button to select it.
2.  **Process File**: Once a file is selected, click the "Process File" button.
3.  **Download**: If the file is processed successfully, a download button will appear. Click it to download the summarized Excel file.
4.  **Error Handling**: If the uploaded file is missing the required columns or another error occurs, a descriptive error message will be shown.
