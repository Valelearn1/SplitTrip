#!/bin/sh
# Icone dell'app installabile (D-63) dal mappamondo di public/favicon.svg, con Chrome headless (macOS).
# Uso, dalla cartella FE: sh scripts/make-pwa-icons.sh
set -e
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
SVG="file://$(pwd)/public/favicon.svg"
TMP=$(mktemp -d)
render() { # dimensione, file, fondo, percentuale del mappamondo
  # la finestra headless disegna solo ~288 px di altezza: le icone grandi si disegnano a metà misura con densità 2
  scale=1; css=$1
  if [ "$1" -gt 256 ]; then scale=2; css=$(($1 / 2)); fi
  cat > "$TMP/icon.html" <<HTML
<html><body style="margin:0;width:${css}px;height:${css}px;background:$3;display:grid;place-items:center"><img src="$SVG" style="width:$4%;height:$4%"></body></html>
HTML
  "$CHROME" --headless=new --hide-scrollbars --default-background-color=00000000 --force-device-scale-factor=$scale \
    --window-size="$css,$css" --screenshot="public/$2" "file://$TMP/icon.html" >/dev/null 2>&1
}
render 192 pwa-192.png transparent 100
render 512 pwa-512.png transparent 100
render 512 pwa-maskable-512.png '#f8f9ff' 72   # il mappamondo nell'area sicura (cerchio dell'80%)
render 180 apple-touch-icon.png '#f8f9ff' 80   # iPhone riempie la trasparenza di nero: fondo pieno
rm -rf "$TMP"
