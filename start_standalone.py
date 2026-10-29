"""
IntelliGreen Field Service Portal — Standalone Server Launcher
Runs both Frontend React PWA and Backend FastAPI on a single port (http://localhost:8000).
"""

import os
import sys
import socket
import subprocess
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent
FRONTEND_DIR = ROOT_DIR / "frontend"
BACKEND_DIR = ROOT_DIR / "backend"
FRONTEND_DIST = FRONTEND_DIR / "dist"

def is_port_in_use(port: int = 8000) -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.settimeout(0.5)
        return s.connect_ex(('127.0.0.1', port)) == 0

def ensure_frontend_built():
    if not (FRONTEND_DIST / "index.html").exists():
        print("[INFO] Frontend production build not found. Compiling React PWA...")
        subprocess.run(["npm", "run", "build"], cwd=str(FRONTEND_DIR), check=True, shell=True)
        print("[INFO] Frontend compiled successfully!")
    else:
        print("[INFO] Production frontend bundle found in frontend/dist.")

def run_server():
    if is_port_in_use(8000):
        print("\n" + "!" * 65)
        print("  [PORT CONFLICT] Port 8000 is ALREADY IN USE by another process!")
        print("!" * 65)
        print("  The IntelliGreen standalone portal is ALREADY active and running at:")
        print("  -> http://localhost:8000")
        print("\n  If you want to restart the server:")
        print("  1. Close the terminal or process currently holding port 8000.")
        print("  2. Then run 'python start_standalone.py' or double-click 'start_standalone.bat'.")
        print("!" * 65 + "\n")
        return

    venv_python = BACKEND_DIR / ".venv" / "Scripts" / "python.exe"
    python_bin = str(venv_python) if venv_python.exists() else sys.executable

    print("\n" + "=" * 65)
    print("  INTELLIGREEN TECHNOLOGIES — STANDALONE FIELD PORTAL")
    print("=" * 65)
    print("  [PORTAL URL] http://localhost:8000")
    print("  [COMMISSIONING] http://localhost:8000/commissioning")
    print("  [PPM CHECK LIST] http://localhost:8000/ppm")
    print("  [API DOCS] http://localhost:8000/docs")
    print("=" * 65)
    print("  To access from your mobile phone on the same Wi-Fi:")
    print("  http://<your-computer-ip>:8000")
    print("=" * 65 + "\n")

    cmd = [
        python_bin,
        "-m",
        "uvicorn",
        "app.main:app",
        "--host",
        "0.0.0.0",
        "--port",
        "8000",
        "--reload",
    ]
    subprocess.run(cmd, cwd=str(BACKEND_DIR))

if __name__ == "__main__":
    ensure_frontend_built()
    run_server()
