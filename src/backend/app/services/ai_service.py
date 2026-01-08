from google import genai
from app.core.config import settings
from pydantic import BaseModel
from typing import Any, Dict, Optional
import os
import tempfile
import re
import base64
import shutil


class AIRequest(BaseModel):
    prompt: str

class AIResponse(BaseModel):
    response_text: str

class AIAgent():
    def __init__(self, api_key: str):
        self.client = genai.Client(api_key=api_key)
    
    def make_prompt(self, data: Any) -> AIRequest:
        """
        From the provided data on batches supplied in each warehouse, every transaction made and expenses incurred,
        -> create a detailed prompt for the AI model to generate a comprehensive business report and visualizations.
        """
        prompt = f"""
        You are a senior retail data analyst.

        Using the batch-based sales data below, generate BOTH:
        1) Python code for visual charts
        2) A written business report

        Data Details:
        {data} 
        Description: The data includes store information, warehouse details, batch stock levels, costs, sales prices, transaction items, and tax details.
        In detail, each warehouse is associated with a store, and each batch is linked to a product. Transaction items reflect sales made from these batches, along with their respective dates and quantities sold.
        Each product may also have associated tax details. Every store incurs expenses that need to be factored into the overall analysis. After detailed analysis, provide insights and recommendations for improving sales performance and inventory management.

        OUTPUT FORMAT (STRICT):

        ### PYTHON_CODE
        Only valid Python code.
        Use pandas and matplotlib.
        One chart per figure.
        No explanations, no markdown.
        No plt.show(), no print statements.
        Save each figure using fig.savefig(...) in the cwd/images/ directory

        ### REPORT_TEXT
        Include:
        - Visual insights
        - Sales and batch analysis
        - Executive summary (4–5 sentences)
        - 5 actionable recommendations

        Use clear headings and bullet points for titles, sections and paragraphs. The Python code must be executable without modification.
        """
        return AIRequest(prompt=prompt)

    def get_response(self, request: AIRequest) -> AIResponse:
        response = self.client.models.generate_content(
            model="gemini-2.5-flash", contents=request.prompt
        )
        return AIResponse(response_text=response.text)
    
    @staticmethod
    def parse_output(text: str):
        # Extract sections robustly and clean common fencing/triple-quote wrappers
        try:
            parts = text.split("### PYTHON_CODE")
            after_code = parts[1]
            code_part, report_part = after_code.split("### REPORT_TEXT")
        except Exception:
            # Fallback: try to locate markers more permissively
            try:
                code_part = text.split("### PYTHON_CODE")[1]
                report_part = text.split("### REPORT_TEXT")[1]
            except Exception:
                return text, ""

        def clean_code_block(s: str) -> str:
            s = s.strip()
            # remove fenced code blocks ``` or ```python
            s = re.sub(r"^```(?:python|py)?\n", "", s, flags=re.IGNORECASE)
            s = re.sub(r"\n```$", "", s)
            # remove surrounding triple quotes
            if s.startswith('"""') and s.endswith('"""'):
                s = s[3:-3]
            if s.startswith("'''") and s.endswith("'''"):
                s = s[3:-3]
            return s.strip()

        code = clean_code_block(code_part)
        report = clean_code_block(report_part)
        return code, report
    
    @staticmethod
    def execute_analysis(code: str):
        # Execute the generated code inside a fresh temporary workspace so that
        # any relative paths (e.g. output_dir = 'images') resolve inside it.
        temp_dir = tempfile.mkdtemp(prefix="ai_exec_")
        original_cwd = os.getcwd()

        # Prepare execution environment with common libs available
        local_vars: Dict[str, Any] = {}
        exec_globals = {
            "__builtins__": __builtins__,
            "pd": __import__("pandas"),
            "plt": __import__("matplotlib.pyplot"),
            "os": os,
        }

        try:
            os.chdir(temp_dir)
            # Run the code
            exec(code, exec_globals, local_vars)

            # Look for images inside the temp workspace (commonly under ./images)
            images_dir = os.path.join(temp_dir, "images")
            saved_images = []
            if os.path.isdir(images_dir):
                for f in os.listdir(images_dir):
                    if f.lower().endswith(('.png', '.jpg', '.jpeg')):
                        saved_images.append(os.path.join(images_dir, f))

            # Read and return base64-encoded image data (without data URI prefix)
            encoded = []
            for p in saved_images:
                with open(p, 'rb') as fh:
                    b = fh.read()
                encoded.append(base64.b64encode(b).decode('ascii'))

            return encoded
        finally:
            os.chdir(original_cwd)
            # cleanup temp dir
            try:
                shutil.rmtree(temp_dir)
            except Exception:
                pass
    
ai_agent = AIAgent(api_key=settings.GEMINI_API_KEY)

# Example usage
if __name__ == "__main__":

    prompt = """
    You are a senior retail data analyst.

    Using the batch-based sales data below, generate BOTH:
    1) Python code for visual charts
    2) A written business report

    Store Information:
    - Store type: grocery store
    - Store size: medium
    - Customer profile: price-sensitive

    Batch Sales Data (CSV):
    Product,BatchID,UnitsSold,UnitPrice,BatchRevenue,BatchDate
    Rice 5kg,R-A01,320,18,5760,2025-07-10
    Rice 5kg,R-A02,280,18,5040,2025-08-12
    Rice 5kg,R-A03,190,18,3420,2025-09-08
    Cooking Oil 1L,O-B01,410,6,2460,2025-07-18
    Cooking Oil 1L,O-B02,460,6,2760,2025-08-20
    Cooking Oil 1L,O-B03,390,6,2340,2025-09-15
    Sugar 2kg,S-C01,260,4,1040,2025-07-05
    Sugar 2kg,S-C02,300,4,1200,2025-08-10
    Sugar 2kg,S-C03,220,4,880,2025-09-12
    Milk 1L,M-D01,520,2,1040,2025-07-03
    Milk 1L,M-D02,610,2,1220,2025-08-06
    Milk 1L,M-D03,570,2,1140,2025-09-04

    ---

    OUTPUT FORMAT (STRICT):

    ### PYTHON_CODE
    Only valid Python code.
    Use pandas and matplotlib.
    One chart per figure.
    No explanations, no markdown.
    No plt.show(), no print statements.
    Save each figure using fig.savefig(...)

    ### REPORT_TEXT
    Include:
    - Visual insights
    - Sales and batch analysis
    - Executive summary (4–5 sentences)
    - 5 actionable recommendations

    Use clear headings and bullet points between titles, sections, and paragraphs. The Python code must be executable without modification.
    """


    # The client gets the API key from the environment variable `GEMINI_API_KEY`.
    client = genai.Client(api_key=settings.GEMINI_API_KEY)

    response = client.models.generate_content(
        model="gemini-2.5-flash", contents=prompt
    )

    with open("ai_output.txt", "w", encoding="utf-8") as f:
        f.write(response.text)
    print("AI response written to ai_output.txt")

    python_code, report_text = parse_output(response.text)
    with open("generated_code.py", "w", encoding="utf-8") as f:
        f.write(python_code)
    with open("business_report.txt", "w", encoding="utf-8") as f:
        f.write(report_text)


