from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from app.api.login import router as login_router
from app.api.summary import router as summary_router
from app.api.report import router as report_router

app = FastAPI(
    title="IntelliGreen Field Technician Portal",
    description="Standalone Field Service & Air Quality Reporting Platform",
    version="2.0.0"
)

# CORS configuration to support local development (e.g. Vite on port 5173) and cloud deployments
# CORS configuration
origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Include API endpoints
app.include_router(login_router)
app.include_router(summary_router)
app.include_router(report_router)

from app.api.report import get_smtp_status, trigger_smtp_test, get_supabase_status

@app.get("/api/smtp-status")
@app.get("/api/smtp-status/")
@app.get("/smtp-status")
@app.get("/smtp-status/")
def direct_smtp_status():
    return get_smtp_status()

@app.get("/api/test-smtp")
@app.get("/api/test-smtp/")
@app.get("/test-smtp")
@app.get("/test-smtp/")
@app.post("/api/test-smtp")
@app.post("/api/test-smtp/")
@app.post("/test-smtp")
@app.post("/test-smtp/")
def direct_test_smtp():
    return trigger_smtp_test()

@app.get("/api/supabase-status")
@app.get("/api/supabase-status/")
@app.get("/supabase-status")
@app.get("/supabase-status/")
def direct_supabase_status():
    return get_supabase_status()


# Resolve path to frontend production build (SPA)
FRONTEND_DIST = Path(__file__).resolve().parent.parent.parent / "frontend" / "dist"

# Mount /assets if frontend is compiled
if (FRONTEND_DIST / "assets").exists():
    app.mount("/assets", StaticFiles(directory=str(FRONTEND_DIST / "assets")), name="assets")


@app.get("/")
def serve_root():
    """
    Serves the React PWA frontend in standalone mode.
    """
    index_file = FRONTEND_DIST / "index.html"
    if index_file.exists():
        return FileResponse(index_file)
    return {
        "portal": "IntelliGreen Field Technician Portal",
        "status": "Standalone Backend Running",
        "frontend": "Run 'npm run build' inside frontend/ to bundle the SPA interface.",
    }


@app.get("/{full_path:path}")
def serve_spa(full_path: str):
    """
    Catches all frontend navigation routes (e.g. /commissioning, /ppm, /login)
    and serves either the requested static asset or the single-page application index.html.
    Includes Path Traversal protection (CWE-22).
    """
    # Do not intercept API routes, OpenAPI documentation, or redoc
    if full_path.startswith("api/") or full_path in ("docs", "redoc", "openapi.json"):
        raise HTTPException(status_code=404, detail="API route not found")

    # Secure Path Traversal check: ensure target file strictly resolves inside FRONTEND_DIST
    try:
        resolved_dist = FRONTEND_DIST.resolve()
        target_file = (FRONTEND_DIST / full_path).resolve()
        if target_file.is_file() and target_file.is_relative_to(resolved_dist):
            return FileResponse(target_file)
    except (ValueError, Exception):
        raise HTTPException(status_code=403, detail="Access denied")

    # SPA fallback to index.html for client-side routing
    index_file = FRONTEND_DIST / "index.html"
    if index_file.exists():
        return FileResponse(index_file)

    raise HTTPException(status_code=404, detail="Frontend bundle not found. Please run 'npm run build' in frontend/.")
