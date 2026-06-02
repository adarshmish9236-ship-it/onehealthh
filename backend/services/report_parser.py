import io
import pdfplumber
import pytesseract
from PIL import Image

def parse_report_file(file_stream, filename: str) -> str:
    """
    Extract text from a medical report file (PDF or Image).
    Supported formats: PDF, JPG, PNG
    """
    ext = filename.split('.')[-1].lower() if '.' in filename else ''
    extracted_text = ""
    
    if ext == 'pdf':
        try:
            with pdfplumber.open(file_stream) as pdf:
                for page in pdf.pages:
                    text = page.extract_text()
                    if text:
                        extracted_text += text + "\n"
        except Exception as e:
            raise ValueError(f"Failed to parse PDF: {str(e)}")
    elif ext in ['jpg', 'jpeg', 'png']:
        try:
            image = Image.open(file_stream)
            extracted_text = pytesseract.image_to_string(image)
        except Exception as e:
            raise ValueError(f"Failed to parse Image: {str(e)}")
    else:
        raise ValueError(f"Unsupported file extension: {ext}")
        
    return extracted_text.strip()
