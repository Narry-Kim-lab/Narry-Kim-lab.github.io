---
title: "Photos"
layout: gridlay
excerpt: "Photos and videos from the Narry Kim lab: graduations, symposia, outings and lectures."
permalink: /photos/
---

# Photos

{%- comment -%}
  _data/photos.yml, in the periods it groups the entries by, newest first.
  A photo links to its full-size file, which js/site.js opens in the viewer
  below (data-lightbox; the date and caption ride along for its caption); a
  video's thumbnail links to YouTube.
{%- endcomment %}
{%- assign periods = site.data.photos | group_by: "period" %}
{%- for period in periods %}

## {{ period.name }}

<div class="photo-grid" markdown="0">
{%- for item in period.items %}
<figure class="photo-item">
{%- if item.youtube %}
<a href="https://www.youtube.com/watch?v={{ item.youtube }}">{% picture photo images/photos/{{ item.thumb }} alt="Video: {{ item.caption | default: item.date }}" loading="lazy" %}<span class="photo-play">{% include icon.html name="play" %}</span></a>
{%- else %}
<a href="{{ '/images/photos/' | append: item.photo | relative_url }}" data-lightbox data-date="{{ item.date }}" data-caption="{{ item.caption | escape }}">{% picture photo images/photos/{{ item.photo }} alt="{{ item.caption | default: 'Lab photo' }}, {{ item.date }}" loading="lazy" %}</a>
{%- endif %}
<figcaption><span class="team-role">{{ item.date }}</span>{{ item.caption }}</figcaption>
</figure>
{%- endfor %}
</div>
{%- endfor %}

{%- comment -%}
  The photo viewer: a modal dialog over the darkened page, opened and driven
  by js/site.js. It holds one photo at a time, as large as the window allows
  at its own proportions, with buttons to the previous and next photo in page
  order (wrapping round at the ends) and to close it.
{%- endcomment %}
<dialog class="lightbox" aria-label="Photo viewer" tabindex="-1" markdown="0">
<div class="lightbox-stage">
<figure class="lightbox-figure">
<img class="lightbox-img" alt="" data-proofer-ignore>
<figcaption class="lightbox-caption"><span class="lightbox-date"></span> <span class="lightbox-text"></span> <span class="lightbox-count"></span></figcaption>
</figure>
</div>
<button type="button" class="lightbox-button lightbox-prev" aria-label="Previous photo">{% include icon.html name="caret-left" %}</button>
<button type="button" class="lightbox-button lightbox-next" aria-label="Next photo">{% include icon.html name="caret-right" %}</button>
<button type="button" class="lightbox-button lightbox-close" aria-label="Close">{% include icon.html name="times" %}</button>
</dialog>
