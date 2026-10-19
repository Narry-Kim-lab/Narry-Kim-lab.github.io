#!/bin/sh -e
# Local preview at http://localhost:4001 while you edit: Jekyll rebuilds the
# site whenever a file changes, and the page open in the browser reloads
# itself once the rebuild is done (livereload, through port 35729). Changes
# to _config.yml are the exception: stop this (Ctrl-C) and run it again.
#
# Port 4001 rather than Jekyll's 4000, so it can run beside the Chang lab
# site's preview. Anything after ./run.sh goes to `jekyll serve`, e.g.
#   ./run.sh --port 4002
#
# Uses the nklabwww conda env (environment.yml) where cdrun is available,
# plain Bundler elsewhere.
cd "$(dirname "$0")"
set -- --livereload --port 4001 "$@"
if command -v cdrun >/dev/null 2>&1; then
    exec cdrun nklabwww bundle exec jekyll serve "$@"
fi
exec bundle exec jekyll serve "$@"
