# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Jekyll 4 static site for the Narry Kim Lab (RNA biology) at the Institute for Basic Science
and Seoul National University, meant to go live at **narrykim.org** in place of the
lab's WordPress site there. English only.

The design and the code are the Chang lab's site (qbio.io, `../ChangLabSNU.github.io`)
with its colours changed; the content came from the old narrykim.org. When in doubt about
how something should look or work, do what the Chang lab site does.

Tech stack: Jekyll 4.x (Gemfile pins `~> 4.3`), Kramdown (GFM), Liquid templates, Dart Sass.

- CSS: `_sass/_base.scss` is Bootstrap 3.3.7 + Bootswatch Lumen compiled once to plain CSS
  and pruned to what the site uses (its header says what was kept); edit it directly.
  `css/main.scss` holds the site's own rules on top and pulls it in with `@use`. No Bootstrap
  SCSS, mixins or variables remain, and Sass builds with no deprecations silenced -- keep it
  that way (`@use`, not `@import`).
- Design: colours, widths and the font stack are custom properties on `:root` at the top
  of `css/main.scss`; use them rather than new hex values. Two colours carry the lab's
  identity: the old site's red, the one point colour, and `--grey`, the IBS logo's mid
  grey, from which the neutrals are drawn. The red comes in three strengths:
  `--accent` (`#ca2017`, the old site's own) fills and outlines the buttons and marks
  things -- the band along the bottom of the home masthead, the carousel's current dot;
  `--link` (`#ae241d`, the same red with saturation and lightness each cut by a tenth) is
  every red that is text on a light ground -- links, member names, news dates, the home
  page's current section, the outline button's label; and `--on-ink-link` (`#f0867d`) is
  red on the dark header and footer -- footer links, the current section's underline.
  Check contrast (4.5:1 for text) before adding a colour.
  The type is Ubuntu Sans, self-hosted (`fonts/`, `@font-face` in `_sass/_fonts.scss`):
  Latin-only variable cuts of the roman and italic, weight 400-800. Their
  `unicode-range` lists exactly the characters the files have, so anything else (Greek
  letters such as the β in some titles) falls back to a system font. The cut is named
  "Ubuntu Sans derivative QBio" inside the files, as the Ubuntu Font Licence requires of
  a modified copy (`fonts/UbuntuSans-LICENCE.txt`); it is the Chang lab's cut, unchanged.
  On the text pages (textlay: research, join, contact, about, news) running text stops at
  36em, about 70 characters a line; floated figures keep the column's right-hand side.
- Only the home page (the one with `hero:` front matter) has the pale masthead -- a
  gradient from `--tint`, the IBS grey made very pale, to `--tint-warm`, warmed towards
  the red band under it -- and the ink footer. Every other page gets `<body class="inner">`: a dark `--charcoal`
  header and footer (the old site's #222) and a darker grey text (the `body.inner`
  block in `css/main.scss` repoints the tokens).
- Content pages share the people page's pieces (the "shared pieces" block in
  `css/main.scss`): `.chip` icon buttons for links, `.team-role` for a bold grey role
  line, photos with 12px corners and no shadow, and rows split by `--hairline` rules.
- JS: `js/site.js` runs the home carousel, driving Bootstrap 3's CSS classes directly (no
  jQuery), and makes the email buttons mailto links. The carousel holds still while the
  mouse is over it or keyboard focus is in it (WCAG 2.2.2), stops autoplaying under
  `prefers-reduced-motion`, and its arrows answer Enter and Space.
- The hero is static for now. The Chang lab's hero has an animated pixel scene
  (`js/ribosome.js`) where this one has the red band; one may come later.
- Icons: Font Awesome Free 5.15.3 shapes as inline SVG (see Conventions). The site icon is
  the old site's black RNA strand: `favicon.ico` (16, 32, 48px), `favicon-192.png`, and
  `apple-touch-icon.png` (180px on white, since iOS fills transparency with black).

## Build & Serve

Ruby version is pinned in `.ruby-version` (CI reads it too); `Gemfile.lock` needs Bundler 4.
On the lab server Ruby, Bundler and the gems live in the `nklabwww` conda env
(`environment.yml`). Enter it with `cdrun`; plain `bundle` outside it is the system Ruby
and will not match. The env was first made as a clone of the Chang lab's `qbiowww`,
whose Gemfile and lock this site shares; if the locks drift apart, update this env, not
that one. `run.sh` serves on port 4001 (the Chang lab preview takes 4000) with
livereload, which also needs port 35729.

```bash
cdrun nklabwww "bundle install"      # Install dependencies into the env
./run.sh                             # Dev server at http://localhost:4001, live reload
cdrun nklabwww "JEKYLL_ENV=production bundle exec jekyll build"   # Production build into _site/
```

CI also runs `htmlproofer` over `_site/` (internal links and images only); the exact
invocation is in `.github/workflows/jekyll.yml` and README.md. Run it before pushing.

## Architecture

### Data-driven content (`_data/`)

All dynamic content lives in YAML data files. `_plugins/data_check.rb` checks them on every
build and fails it with a list of problems: missing required fields, an author `link` that
is not in team.yml, unknown categories, a non-boolean `active`, missing photos, years or
dates out of order, icon names missing from `icons.yml`. Its rules mirror what the
templates read -- when a template starts reading a new field, update the matching rule.

- **team.yml** — Members, current (`active: true`, shown on /people/) and former. Fields:
  `name`, `photo` (file in `images/members/`), `info` (the role line), `category`
  (principal-investigator/postdoc/student/research-assistant/support), `sort-key`
  (lastname-firstname), `active`, optional `intro` (one line on the card), `email`, and
  `link`, the slug of the profile page `_pages/people/<link>.md`. The PI has no `link` and
  no profile page: the people page's opening band shows her `cv`, `pubmed` and `email`.
- **publist.yml** — Papers, newest first; /publications/ groups them by `year` as they
  come, so the order matters (the data check enforces it). Fields: `authors`, `title`,
  `journal`, `year`, `vip` (volume and pages, optional), `doi`, `url` (where the title
  links). Each author has `name` as printed ("J. J. Seo") and, for a lab member, either
  `link` (a team.yml link, for someone with a profile page) or `lab: true` (bold, no
  link), plus `is_first`/`is_corresponding` for the superscripts. Journal names are
  spelled out in full and consistently, since /publications/by-journal/ groups by them.
- **chapters.yml** — Book chapters, the same fields as publist.yml.
- **patents.yml** — Patents, by `title`.
- **alumni_members.yml** — Former members, most recently departed first (the people page
  keeps file order): `name`, `position`, `years` ([first, last] or [last]), `current`
  (where they are now), optional `url` (an outside page about them).
- **news.yml** — Announcements, newest first: `date` ("Feb 26, 2025", or a year alone,
  "2025", when the day is not known) and `headline` (HTML allowed).
- **photos.yml** — The photos page, newest first: `period` (the heading it falls under,
  "2021–2025"), `date` ("May 2025"), `caption`, and either `photo` (a file in
  `images/photos/`) or `youtube` (a video id) with `thumb` (its thumbnail, also in
  `images/photos/`; YouTube's `hqdefault.jpg` with the letterbox bars cut off).

### Layouts (`_layouts/`)

- **default.html** — Base: the masthead (`header.html`, plus `hero.html` when the page has
  `hero:` front matter), the content and the footer.
- **homelay.html** — Two-column (8/4) with news sidebar.
- **gridlay.html** — Full-width grid (people, publications, photos).
- **textlay.html** — Full-width text (research, join, contact, all news, about, 404).
- **member.html** — A member's profile: photo, name and position, then the links (CV,
  GitHub, Google Scholar, PubMed, email) as icon buttons beside the text, and the member's
  papers from `{% include publication_in_profile.html %}` in the page body, which matches
  the page's file name against author `link`s. The email button is
  `_includes/email_chip.html`: text with a hidden word in the HTML, against harvesters,
  which `js/site.js` makes a mailto link.

### Pages (`_pages/`)

Content pages live here. Member profiles are in `_pages/people/[link].md`. The sections
are People (/people/), Research, Publications (with /publications/by-journal/), Photos,
and the "Join us" button (/join/); Contact and About this site are linked from the footer,
All news from the home page.

### Key includes (`_includes/`)

- **header.html** — Wordmark, the four section links and the "Join us" button.
  `aria-current` marks the section of the current page (its first URL segment): "page" on
  the section's own page, "true" on a page under it (a profile under People).
- **hero.html** — The home page's headline, intro and buttons, from the page's `hero:`
  front matter (see `_pages/home.md`).
- **team_lead.html** — The people page's opening band: the PI's photo, role, name and
  buttons.
- **team_list.html** — The member cards (4:5 photo, name, role, optional intro; each a link
  to the profile), for the active members in `selected_categories`. With
  `order="monthly"` they are shuffled into an order seeded by the month in Korea
  (`_plugins/monthly_shuffle.rb`); `TEAM_ORDER_MONTH=2026-11` builds as if it were
  another month.
- **publication_entry.html** — One publication (title, authors, journal, year, volume),
  used on both publication pages and the profiles; **publication_author_list.html**
  formats its authors; **publication_extras.html** is the book chapters and patents both
  publication pages end with.

## Common Content Tasks

### Add a team member

1. Add an entry to `_data/team.yml` with `active: true`
2. Create `_pages/people/<link>.md` (copy an existing one): front matter `layout: member`,
   `title` (the name), `position`, `image`, `permalink: /people/<link>`, and any of
   `email`, `github`, `scholar` (the user id), `pubmed` (a full search URL), `cv` that
   apply; then an optional bio and `{% include publication_in_profile.html %}`
3. Add the photo as `images/members/<link>.jpg`, at least 520px wide (the people page
   crops it to 4:5 around the centre and resizes it)

### Add a publication

Add an entry to the top of `_data/publist.yml`. Give lab authors `link:` if they have a
profile page, `lab: true` otherwise.

### Add news

Add an entry to the top of `_data/news.yml`. HTML is supported in `headline`.

### Add photos

Put the file in `images/photos/` (`YYMM-what.jpg`, at most about 2000px on the long side)
and add an entry to `_data/photos.yml` in date order, under its period. For the home
carousel, crop a 3:2 copy into `images/home-slider/` and add a slide and a dot to the
carousel in `_pages/home.md`; every slide but the first carries `loading="lazy"`.

### Move a member to former members

Set `active: false` in team.yml (the profile stays, so author links keep working), set
`position: Former member (<first year>–<last year>)` on the profile page, and add an
entry to the top of `_data/alumni_members.yml`.

### Change a page's social card

`_includes/head.html` builds the title, description, canonical link and Open Graph tags
from front matter: `title`, the page's short name (the tab shows "People | Narry Kim Lab",
except on the home page), `excerpt`, one sentence on what the page holds (falls back to
`site.description`), and `image` (falls back to a lab photo). Member pages compose their
description from `title` and `position`. `sitemap: false` excludes a page from the sitemap
(the 404 page has it).

## Conventions

- Headings never skip a level: a page has one `#` (its title), and its sections are `##`.
  CSS sets their size per context; do not drop to `###`/`####` for size.
- Member URL slugs: lowercase hyphenated (`jane-doe`); sort keys `lastname-firstname`.
- Publication author superscripts: `<sup>1</sup>` = co-first author, `<sup>*</sup>` =
  co-corresponding author.
- Custom plugins: `_plugins/sri.rb` adds an `sri` filter that hashes a local file at build
  time: `<script src="..." integrity="{{ '/js/x.js' | sri }}">`. Use it for every script tag.
  `_plugins/data_check.rb` validates `_data/` (see above).
- Photos go through `{% picture <preset> <path> alt="..." %}` (`_plugins/picture.rb`), not a
  bare `<img>`: it publishes WebP copies at the widths of the preset (`pictures:` in
  `_config.yml`) with `srcset`/`sizes` and the right `width`/`height`, so commit the
  JPEG and let the build resize it. A production build needs libvips (in
  `environment.yml`; CI installs it); other builds fall back to the original image. The
  member page photo and Open Graph images stay plain JPEG, since link-preview crawlers
  handle WebP poorly.
- Icons are inline SVG, not an icon font: `{% include icon.html name="youtube" %}`. The
  shapes live in `_data/icons.yml`, from Font Awesome Free 5.15.3 (CC BY 4.0); to add one,
  copy its `viewBox` and path from that version's SVG. The data check fails the build on
  a name that is not there.
- No inline scripts, no `style="..."` attributes or `<style>` blocks, and no third-party
  scripts, fonts or images: the site should keep working under a strict
  Content-Security-Policy (`script-src 'self'`, no `'unsafe-inline'`). A one-off style
  gets a class in `css/main.scss`. Videos are linked, not embedded.
- Links to the site's own pages and assets are root-relative (`{{ site.baseurl }}/...` or
  `relative_url`), never `{{ site.url }}`; only canonical and Open Graph URLs use
  `absolute_url`.

## Deployment

GitHub Pages. `.github/workflows/jekyll.yml` builds every push and pull request with
`JEKYLL_ENV=production` and link-checks the result; only `main` is deployed. It also
rebuilds on a schedule around the turn of each month, which brings in the people page's
new monthly order (GitHub turns off a public repository's schedules after 60 days without
activity; re-enable the workflow in the Actions tab if the order stops changing).
`.github/workflows/external-links.yml` checks outbound links every Monday and keeps a
single "Broken external links" issue open while any fail; it ignores 403/429, which
publishers send to every bot. Dependabot proposes action and gem updates monthly.
There is no `CNAME` yet: add one holding `narrykim.org` when the domain moves here.
