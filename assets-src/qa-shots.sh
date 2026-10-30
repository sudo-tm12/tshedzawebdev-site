#!/bin/bash
# Full-page screenshots of every route at phone and desktop width → qa/<name>-{m,d}.png
CH="/c/Program Files/Google/Chrome/Application/chrome.exe"
BASE=http://localhost:4711
mkdir -p qa
for r in "home|/" "services|/services/" "svc-websites|/services/websites/" "svc-trading|/services/trading-bots/" "work|/work/" "work-blr|/work/blr-tutoring/" "work-light|/work/the-light-express/" "quote|/quote/#s=website&t=business&u=8&a=booking&m=care" "about|/about/" "learn|/learn/" "faq|/faq/" "contact|/contact/" "privacy|/privacy/" "terms|/terms/" "404|/nope/"; do
  n=${r%%|*}; p=${r#*|}
  "$CH" --headless --disable-gpu --hide-scrollbars --no-first-run --user-data-dir="$TEMP/qa-prof" --virtual-time-budget=5000 --window-size=1440,5200 --screenshot="$(cygpath -w "$PWD/qa/$n-d.png")" "$BASE$p" 2>/dev/null
  "$CH" --headless --disable-gpu --hide-scrollbars --no-first-run --user-data-dir="$TEMP/qa-prof" --virtual-time-budget=5000 --window-size=390,7000 --screenshot="$(cygpath -w "$PWD/qa/$n-m.png")" "$BASE$p" 2>/dev/null
done
missing=0; for f in qa/*-d.png qa/*-m.png; do :; done
for r in home services svc-websites svc-trading work work-blr work-light quote about learn faq contact privacy terms 404; do for v in d m; do [ -s "qa/$r-$v.png" ] || { echo "MISSING qa/$r-$v.png"; missing=1; }; done; done
[ $missing = 0 ] && echo "all captures present"
echo shots done
