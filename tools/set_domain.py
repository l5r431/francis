#!/usr/bin/env python3
"""Set your real website address in every page, robots.txt and sitemap.xml.

Search engines need full web addresses for the canonical links, social sharing
images, structured data and the sitemap. The site ships with a placeholder.

Usage:
    python tools/set_domain.py https://www.yourdomain.com

Use the address exactly as people reach your site (with or without www, https),
and no slash or page name at the end. You can run it again if the address changes.
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def main():
    if len(sys.argv) != 2:
        print(__doc__)
        sys.exit(1)
    new = sys.argv[1].strip().rstrip("/")
    if not re.match(r"^https?://[^/\s]+\.[^/\s]+$", new):
        sys.exit("Please give a full address like https://www.yourdomain.com (no page name at the end).")

    robots = (ROOT / "robots.txt").read_text(encoding="utf-8")
    m = re.search(r"^Sitemap:\s*(https?://[^/\s]+)/sitemap\.xml", robots, re.M)
    if not m:
        sys.exit("Could not find the current address in robots.txt.")
    old = m.group(1)
    if old == new:
        print("Already set to", new)
        return

    total = 0
    for f in list(ROOT.glob("*.html")) + [ROOT / "robots.txt", ROOT / "sitemap.xml"]:
        text = f.read_text(encoding="utf-8")
        n = text.count(old)
        if n:
            f.write_text(text.replace(old, new), encoding="utf-8")
            total += n
    print(f"Changed {old} to {new} in {total} places.")
    print("Next: open robots.txt and sitemap.xml to check them, then submit the sitemap in Google Search Console.")


if __name__ == "__main__":
    main()
