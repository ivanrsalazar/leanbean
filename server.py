"""Run Leanbean locally on one configurable port."""

import os
from pathlib import Path


ROOT = Path(__file__).resolve().parent
FRONTEND_INDEX = ROOT / "frontend" / "dist" / "index.html"


def main() -> None:
    if not FRONTEND_INDEX.is_file():
        raise SystemExit(
            "The frontend has not been built. Run `cd frontend && npm install && npm run build`, "
            "then start Leanbean again."
        )

    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "leanbean.settings")
    host = os.environ.get("LEANBEAN_HOST", "127.0.0.1")
    port = os.environ.get("LEANBEAN_PORT", "8011")

    from django.core.management import execute_from_command_line

    print(f"Leanbean is running at http://{host}:{port}")
    execute_from_command_line(["manage.py", "runserver", f"{host}:{port}", "--noreload"])


if __name__ == "__main__":
    main()

