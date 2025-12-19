#!/usr/bin/env python3
"""
Rica Local Server - Serves tedana output for Rica visualization

Usage:
    python rica_server.py [--port PORT] [--no-open]

Options:
    --port PORT    Port to serve on (default: 8000)
    --no-open      Don't auto-open browser

Place this script in your tedana output folder and run it to visualize
your ICA components in Rica without manual folder selection.
"""

import argparse
import http.server
import json
import mimetypes
import sys
import webbrowser
from pathlib import Path
from urllib.parse import unquote

# File patterns that Rica needs
RICA_FILE_PATTERNS = [
    "_metrics.tsv",
    "_mixing.tsv",
    "stat-z_components.nii.gz",
    "_mask.nii",
    "report.txt",
    "comp_",
    ".svg",
    "tedana_",
]

# Ensure proper MIME types
mimetypes.add_type("application/gzip", ".gz")
mimetypes.add_type("text/tab-separated-values", ".tsv")


class RicaHandler(http.server.SimpleHTTPRequestHandler):
    """HTTP handler with CORS support and file listing endpoint."""

    def end_headers(self):
        """Add CORS headers to all responses."""
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        super().end_headers()

    def do_OPTIONS(self):
        """Handle CORS preflight requests."""
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        """Handle GET requests with special endpoint for file listing."""
        # Decode URL-encoded path
        path = unquote(self.path)

        if path == "/api/files":
            self.send_file_list()
        else:
            super().do_GET()

    def send_file_list(self):
        """Return JSON list of Rica-relevant files in current directory."""
        files = []
        cwd = Path.cwd()

        # Find all matching files recursively
        for f in cwd.rglob("*"):
            if f.is_file():
                # Check if file matches any Rica pattern
                if any(pattern in f.name for pattern in RICA_FILE_PATTERNS):
                    # Store relative path with forward slashes
                    rel_path = str(f.relative_to(cwd)).replace("\\", "/")
                    files.append(rel_path)

        # Build response
        response_data = {
            "files": sorted(files),
            "path": str(cwd),
            "count": len(files),
        }

        # Send response
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps(response_data, indent=2).encode("utf-8"))

    def log_message(self, format, *args):
        """Custom log format - suppress noisy output."""
        # Safely convert args to strings
        try:
            msg = str(args[0]) if args else ""
            if "/api/files" in msg:
                print(f"[Rica] File list requested")
            elif "GET" in msg and len(args) > 1:
                status = str(args[1])
                # Only log errors (non-2xx responses)
                if not status.startswith("2"):
                    print(f"[Rica] {msg} - {status}")
        except Exception:
            pass  # Silently ignore logging errors


def main():
    parser = argparse.ArgumentParser(
        description="Rica Local Server - Visualize tedana output locally"
    )
    parser.add_argument(
        "--port", type=int, default=8000, help="Port to serve on (default: 8000)"
    )
    parser.add_argument(
        "--no-open", action="store_true", help="Don't auto-open browser"
    )
    args = parser.parse_args()

    # Check for Rica-relevant files
    cwd = Path.cwd()
    rica_files = []
    for f in cwd.rglob("*"):
        if f.is_file() and any(p in f.name for p in RICA_FILE_PATTERNS):
            rica_files.append(f.name)

    if not rica_files:
        print(f"Warning: No tedana output files found in {cwd}")
        print("Make sure you're running this script from a tedana output folder.")
        print()

    # Start server
    try:
        with http.server.HTTPServer(("", args.port), RicaHandler) as httpd:
            url = f"http://localhost:{args.port}"
            print(f"Rica server running at {url}")
            print(f"Serving files from: {cwd}")
            print(f"Found {len(rica_files)} Rica-relevant files")
            print()
            print("Press Ctrl+C to stop the server")
            print()

            if not args.no_open:
                webbrowser.open(url)

            httpd.serve_forever()

    except KeyboardInterrupt:
        print("\nServer stopped.")
        sys.exit(0)
    except OSError as e:
        if "Address already in use" in str(e):
            print(f"Error: Port {args.port} is already in use.")
            print(f"Try: python rica_server.py --port {args.port + 1}")
        else:
            raise


if __name__ == "__main__":
    main()
