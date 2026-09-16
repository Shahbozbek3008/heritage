# Heritage

Cultural heritage archive — an explorable collection of people, places, stories and photographs on a shared timeline.

![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)

## Overview

Heritage presents a historical archive as a browsable web experience. Records are grouped into people, places and stories, each with its own detail page, and connected through a chronological timeline and a photo gallery.

## Features

- **People** — profiles with individual detail pages
- **Places** — locations with individual detail pages
- **Stories** — long-form entries with individual detail pages
- **Timeline** — chronological view across the whole archive
- **Photos** — gallery of archive imagery
- **Archive** — full searchable index
- Static generation of detail routes for fast loads and SEO

## Tech Stack

| Layer | Choice |
| :--- | :--- |
| Framework | Next.js (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Content | File-based data with generation scripts |

## Project Structure

```
src/
  app/
    people/[slug]     person detail
    places/[slug]     place detail
    stories/[slug]    story detail
    timeline          chronological view
    photos            gallery
    archive           full index
scripts/              content generation utilities
```

## Getting Started

```bash
npm install
npm run dev
```

The app runs on `http://localhost:3000`.
