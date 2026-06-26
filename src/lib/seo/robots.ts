import type { Metadata } from 'next';

// Robots directive for private / utility pages (auth, account, admin, script
// management, OAuth, etc.) that must stay out of search-engine indexes. These
// pages are login-gated, thin, or duplicate, so indexing them only wastes crawl
// budget and risks exposing internal routes.
export const noindexRobots: Metadata['robots'] = {
  index: false,
  follow: false,
};

// Drop-in `metadata` export for pages that only need the noindex directive and
// otherwise inherit their title/description from a parent layout.
export const noindexMetadata: Metadata = {
  robots: noindexRobots,
};
