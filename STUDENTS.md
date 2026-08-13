# Read this first

This is the real website. It's live at https://hmax.space and people actually visit it.
You're editing the same code that serves them — which is why nothing you commit goes
public until it's reviewed.

## How to edit

Open the repo on GitHub, make sure you're on the **`students`** branch, and press the
`.` key. That opens a full VS Code editor in your browser. No install, no setup.
Save, then commit from the left sidebar.

Commit to `students`. Never to `main`. `main` is the live site.

## What the site is

Four pages:

- `/` — Cyber Lab. Shows each visitor their own IP, location, ISP, and device
  fingerprint. This is the point of the site.
- `/homelab` — the server rack and what runs on it
- `/projects`
- `/contact`

Files are organised: `includes/` for shared header/footer, `css/` for styles, `js/` for
scripts, `images/` for images. Each page is its own `.php` file.

## Your job today

**1. Add a credits section.** You built real parts of this site and you should be
credited on it. Add a section — Contact page or footer, your call — that credits the
students who worked on it. Describe your contributions in general terms ("redesigned
the Cyber Lab page," "rebuilt the homelab layout"), not a line-by-line changelog.

Use whatever name you're comfortable having on a public website. First name, first name
and last initial, or a handle are all fine. This page is linked from a video with a lot
of views, so pick deliberately.

**2. Finish what's unfinished.** Polish, fix spacing, tidy up anything that looks
half-done. The Projects page has four entries reading "Write-up coming soon" — those
need real content or they need to go.

## Off limits

Do not touch any of these:

- `vendor/` — the geolocation library
- `log_rtc.php` — must stay exactly where it is; the site's JavaScript posts to that
  exact path
- `.htaccess` — controls page URLs, easy to break in ways that aren't obvious
- **Any PHP inside `<?php ?>` or `<?= ?>` tags.** Those output real live data. If you
  replace one with regular text, the page starts showing fake information to every
  visitor, and the whole purpose of the site is gone. Style around them, don't replace
  them.

The rack photo on the Homelab page is missing right now. That's known — the real photo
goes in later. Leave it alone.

## How this gets published

When you're done, your work sits on the `students` branch. It gets reviewed, and if it
looks good it gets merged to `main` and is live on the public site within two minutes.

Review isn't a formality. Things do get sent back. That's normal — it's how every
software team works.

## If something breaks

Say so. Don't quietly revert it and hope nobody notices. Knowing *what* broke and
*when* is most of debugging, and you're the only one who knows what you just changed.
