#!/usr/bin/env python3
"""Turn a video into numbered JPG frames for the scroll-scrubbed home page hero.

Usage:
    python tools/extract_frames.py my-video.mp4 [fps] [width] [--mobile]

Examples:
    python tools/extract_frames.py my-video.mp4            (24 fps, 1280 px wide: the WIDE frames for computers)
    python tools/extract_frames.py my-video.mp4 20 1600
    python tools/extract_frames.py my-phone-video.mp4 --mobile   (24 fps, 720 px wide: the TALL frames for phones)

Needs ffmpeg installed (https://ffmpeg.org/download.html). Check by typing: ffmpeg -version
Frames go in frames/ (or frames-mobile/ with --mobile), and manifest.js in that folder tells the page how many there are.
Make the --mobile video portrait (about 9:16, for example 720 x 1280) and keep the important action in the middle.
Phones held upright get the frames-mobile/ set; wider screens get the frames/ set.
"""
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)
    args = [a for a in sys.argv[1:] if a != "--mobile"]
    mobile = "--mobile" in sys.argv[1:]
    if not args:
        print(__doc__)
        sys.exit(1)
    video = Path(args[0])
    fps = args[1] if len(args) > 1 else "24"
    width = args[2] if len(args) > 2 else ("720" if mobile else "1280")
    folder = "frames-mobile" if mobile else "frames"
    variable = "HERO_FRAMES_MOBILE" if mobile else "HERO_FRAMES"
    FRAMES = ROOT / folder

    if not video.exists():
        sys.exit(f"Cannot find the video file: {video}")
    if not shutil.which("ffmpeg"):
        sys.exit("ffmpeg was not found. Install it from https://ffmpeg.org/download.html, "
                 "then check that typing 'ffmpeg -version' works in a terminal.")

    FRAMES.mkdir(exist_ok=True)
    for old in FRAMES.glob("frame_*.jpg"):
        old.unlink()

    cmd = ["ffmpeg", "-y", "-i", str(video),
           "-vf", f"fps={fps},scale={width}:-2",
           "-q:v", "4", str(FRAMES / "frame_%04d.jpg")]
    subprocess.run(cmd, check=True)

    files = sorted(FRAMES.glob("frame_*.jpg"))
    count = len(files)
    if count == 0:
        sys.exit("No frames were written. Is this a valid video file?")

    (FRAMES / "manifest.js").write_text(
        "/* written by tools/extract_frames.py */\n"
        f"window.{variable} = {{ count: {count}, path: '{folder}/frame_', digits: 4, ext: 'jpg' }};\n",
        encoding="utf-8")

    mb = sum(f.stat().st_size for f in files) / 1_000_000
    print(f"\nDone: {count} frames, {mb:.1f} MB in total.")
    if count > 300 or mb > 30:
        print("That is a lot for a web page. Try a lower fps (for example 15), a smaller width, or a shorter clip.")
    print("Open index.html and scroll to test.")


if __name__ == "__main__":
    main()
