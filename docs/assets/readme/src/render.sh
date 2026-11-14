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

shoot() { # page name, width, height, scale, output file
  /bin/rm -f "$5"
  # Chrome sometimes exits without a screenshot when the run before it is still closing, so it gets three tries.
  for _try in 1 2 3; do
    # The virtual time budget gives the fonts time to load before the screenshot is taken.
    "$chrome" --headless=new --disable-gpu --hide-scrollbars --no-first-run --no-default-browser-check \
      --user-data-dir="$dir/build/chrome-profile" \
      --default-background-color=00000000 \
      --force-device-scale-factor="$4" --window-size="$2,$3" \
      --virtual-time-budget=6000 \
      --screenshot="$5" "file://$dir/build/$1.html" </dev/null >/dev/null 2>&1 || true
    if [ -s "$5" ]; then return 0; fi
  done
  echo "$1: Chrome produced no screenshot" >&2
  return 1
}

# The pictures depend on web fonts. With no network and nothing cached, Chrome draws in fallback type, and two
# screenshots of that still agree. So first ask a page whether every font arrived, and stop if any did not.
fonts=""
for _try in 1 2 3; do
  fonts="$("$chrome" --headless=new --disable-gpu --no-first-run --no-default-browser-check \
    --user-data-dir="$dir/build/chrome-profile" --virtual-time-budget=6000 \
    --dump-dom "file://$dir/build/fonts-check.html" </dev/null 2>/dev/null |
    grep -o 'data-fonts="[^"]*"' | head -1 || true)"
  if [ -n "$fonts" ]; then break; fi
done
if [ "$fonts" != 'data-fonts="ok"' ]; then
  echo "The fonts did not load (${fonts:-Chrome gave no answer}). Is there a network connection? Nothing was written." >&2
  exit 1
fi

while IFS=$'\t' read -r name w h scale quality; do
  if [ -n "$only" ] && [ "$only" != "$name" ]; then continue; fi
  png="$dir/build/$name.png"
  again="$dir/build/$name.again.png" # Chrome picks the format from the ending, so it must end in .png
  # A screenshot taken before the web fonts arrive shows fallback type. So each page is shot until two shots in a
  # row are the same file, and the run stops if they never agree.
  shoot "$name" "$w" "$h" "$scale" "$png"
  agreed=""
  for _again in 1 2 3 4; do
    shoot "$name" "$w" "$h" "$scale" "$again"
    if cmp -s "$png" "$again"; then agreed=yes; break; fi
    /bin/mv -f "$again" "$png"
  done
  /bin/rm -f "$again"
  if [ -z "$agreed" ]; then echo "$name: no two screenshots agreed, so nothing was written" >&2; exit 1; fi
  if [ "$quality" = "png" ]; then
    /bin/cp -f "$png" "$dir/../$name.png"
  else
    sips -s format jpeg -s formatOptions "$quality" "$png" --out "$dir/../$name.jpg" >/dev/null
  fi
  echo "$name"
done <"$dir/build/sizes.tsv"
