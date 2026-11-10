from pathlib import Path

from django.conf import settings
from django.http import FileResponse, Http404


def frontend(request, path=""):
    """Serve a built Vite asset or the SPA entry point for client-side routes."""
    dist = Path(settings.FRONTEND_DIST).resolve()
    requested = (dist / path).resolve()

    if dist not in requested.parents and requested != dist:
        raise Http404

    target = requested if path and requested.is_file() else dist / "index.html"
    if not target.is_file():
        raise Http404("Frontend build not found. Run `npm run build` in frontend/.")

    return FileResponse(target.open("rb"))

