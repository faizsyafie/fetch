# Company News Tracker

A dashboard for credit analysts aiming to monitor company-specific news from public RSS feeds. Build a custom watchlist by industry, choose sources and time windows, and review aggregated headlines in one place.

## Features

- **Industry watchlists** — Group your companies by sector i.e Energy, Industrials etc.
- **Custom company lists** — Add or remove companies
- **Configurable sources** — Bloomberg (official RSS), Reuters and The Edge Singapore (via Google News RSS), plus custom domains and direct feed URLs
- **Time frame filters** — Last 1, 3, 10, 15, or 30 days
- **Persistent preferences** — Watchlist and source settings saved in the browser

## Getting started

Can just open https://newstracker-ten.vercel.app/ :)

## How it works

1. Select industries and add companies to the sidebar watchlist.
2. Enable or customize news sources (Bloomberg, Reuters, The Edge Singapore, or your own).
3. Pick a time frame and click **Fetch news**.
4. The app queries Google News RSS (company + source domain) and Bloomberg direct feeds, then filters articles by company name, ticker, and publication date.

## Tech stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- rss-parser
- date-fns
