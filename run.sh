#!/bin/sh -e
# Local preview at http://localhost:4000. Uses the conda env in
# environment.yml where cdrun is available, plain Bundler elsewhere.
if command -v cdrun >/dev/null 2>&1; then
    exec cdrun nklabwww bundle exec jekyll serve --watch "$@"
fi
exec bundle exec jekyll serve --watch "$@"
