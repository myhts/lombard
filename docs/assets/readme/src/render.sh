#!/bin/bash
# Renders each page build.py wrote into the picture the README uses, one directory up.
# Needs macOS: Google Chrome takes the screenshot and sips makes the JPEG.
# Chrome runs with its own throwaway profile in build/, so your own Chrome is not touched.
# Usage: python3 build.py && bash render.sh [name]
set -euo pipefail

dir="$(cd "$(dirname "$0")" && pwd)"
chrome="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
only="${1:-}"
mkdir -p "$dir/build/chrome-profile"

while IFS=$'\t' read -r name w h scale quality; do
  if [ -n "$only" ] && [ "$only" != "$name" ]; then continue; fi
  png="$dir/build/$name.png"
  # The virtual time budget gives the fonts time to load before the screenshot is taken.
  "$chrome" --headless=new --disable-gpu --hide-scrollbars --no-first-run --no-default-browser-check \
    --user-data-dir="$dir/build/chrome-profile" \
    --default-background-color=00000000 \
    --force-device-scale-factor="$scale" --window-size="$w,$h" \
    --virtual-time-budget=6000 \
    --screenshot="$png" "file://$dir/build/$name.html" >/dev/null 2>&1
  if [ "$quality" = "png" ]; then
    /bin/cp -f "$png" "$dir/../$name.png"
  else
    sips -s format jpeg -s formatOptions "$quality" "$png" --out "$dir/../$name.jpg" >/dev/null
  fi
  echo "$name"
done <"$dir/build/sizes.tsv"
