---
title: "Photos"
layout: gridlay
excerpt: "Photos and videos from the Narry Kim lab: graduations, symposia, outings and lectures."
permalink: /photos/
---

# Photos

{%- comment -%}
  _data/photos.yml, in the periods it groups the entries by, newest first.
  A photo links to its full-size file; a video's thumbnail links to YouTube.
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
<a href="{{ '/images/photos/' | append: item.photo | relative_url }}">{% picture photo images/photos/{{ item.photo }} alt="{{ item.caption | default: 'Lab photo' }}, {{ item.date }}" loading="lazy" %}</a>
{%- endif %}
<figcaption><span class="team-role">{{ item.date }}</span>{{ item.caption }}</figcaption>
</figure>
{%- endfor %}
</div>
{%- endfor %}
