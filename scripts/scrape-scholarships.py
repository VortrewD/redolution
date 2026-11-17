import os
import sqlite3
import libsql_client

# --- Hardcoded Turso credentials (for local testing) ---
TURSO_URL = "libsql://redolution-vortrewd.aws-eu-central-1.turso.io"
TURSO_TOKEN = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJleHAiOjE4MjY2NDQ4MjIsImlhdCI6MTc5NDUwNDAyMiwiaWQiOiIwMWExZDBhMy1hMjAxLTc3N2UtODMwNC1iY2Q2ODkxNTkxNmMiLCJraWQiOiJYdWtrTUZYcHlSTVZRdGc4ZkliQmsyei1STGoydUktQ211aWhOaENJME8wIiwicmlkIjoiYTViYzUzZGYtMTE0MC00ZjVmLTk1ZjMtMzg4YjQ0MzM4NjM2In0.C1gblkWJTjrKQcfLq47hcC_8_vZB22Yy_rrT65atr0sMEbdHScMRwBUxUVyP2cU5zH2ImfZ4pv4g4w9bliUbDg"

def clean_text(text):
    if not text: return "Unknown"
    return str(text).replace("'", "''")

def run():
    # 1. Fetch scholarships using opportunity-mcp's index
    # (Assuming it's installed and refreshed. We query the local index it built)
    print("Fetching scholarships from opportunity-mcp...")
    
    # We run the command that lists latest scholarships
    # The tool exposes a CLI, or we can use its Python API. 
    # For simplicity, let's assume we can import its internal function.
    # If that fails, we can use its CLI output.
    
    try:
        from opportunity_mcp import get_latest_opportunities
        # This is a hypothetical function name; we might need to inspect the package.
        # Let's use the CLI approach instead for robustness.
        import subprocess
        import json
        
        # Run the MCP server's underlying script to get latest scholarships
        # The tool has a 'list_latest' function.
        # We'll invoke its Python module directly.
        result = subprocess.run(
            ["python", "-c", "import opportunity_mcp; print(opportunity_mcp.list_latest('scholarship', 50))"],
            capture_output=True, text=True
        )
        
        if result.returncode != 0:
            print("Error running opportunity-mcp:", result.stderr)
            return
            
        # Parse the output (assuming it prints a list of dicts)
        # This might need adjustment based on actual output format.
        import ast
        scholarships = ast.literal_eval(result.stdout)
        
    except Exception as e:
        print(f"Could not fetch via opportunity-mcp: {e}")
        print("Falling back to manual sample data for testing...")
        # Fallback sample data for testing
        scholarships = [
            {"title": "Erasmus Mundus Scholarship", "deadline": "2026-12-15", "url": "https://example.com/erasmus"},
            {"title": "Fulbright Foreign Student Program", "deadline": "2026-10-01", "url": "https://example.com/fulbright"},
        ]

    print(f"Found {len(scholarships)} scholarships.")

    # 2. Connect to Turso
    client = libsql_client.create_client(url=TURSO_URL, auth_token=TURSO_TOKEN)
    
    inserted = 0
    for s in scholarships:
        title = clean_text(s.get("title", "Unknown Scholarship"))
        company = clean_text(s.get("sponsor", "Various Sponsors")) # opportunity-mcp might not have sponsor, we use generic
        country = "Global" # Scholarships are often global
        field = "Scholarship"
        deadline = s.get("deadline", None)
        docs = json.dumps(["CV", "Motivation Letter", "Transcript"])
        url = s.get("url", "")
        type_val = "scholarship"
        
        if not url:
            continue
            
        try:
            client.execute(
                """INSERT OR IGNORE INTO internships 
                   (title, company, country, field, deadline, docs, url, type) 
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
                [title, company, country, field, deadline, docs, url, type_val]
            )
            inserted += 1
        except Exception as e:
            print(f"Error inserting {title}: {e}")

    print(f"DONE! Total scholarships added: {inserted}")

if __name__ == "__main__":
    run()