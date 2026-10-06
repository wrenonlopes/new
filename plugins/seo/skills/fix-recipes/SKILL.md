---
name: fix-recipes
description: How to apply SEO fixes per stack (Next.js, Astro, Nuxt, SvelteKit, Vite SPAs, Hugo, Jekyll, static HTML, WordPress, Shopify, Wix, Squarespace, Webflow). Used by /seo:fix; load when changing titles, meta, canonicals, sitemaps, robots.txt, redirects, structured data, rendering mode, alt text, internal links or hreflang.
---

# Fix recipes

## Rules for every fix

- Change only what the fix-queue item names. One item per commit: `seo: <check id> <short description>`.
- Commit locally on the fix branch only. Never push, deploy or publish; approval works as in the `seo-system` skill.
- JSON-LD written as raw HTML must escape `<` as `\u003c` in every stack (`JSON.stringify(data).replace(/</g, '\\u003c')`), so a `</script>` in content cannot break out of the block.
- Read the project first and follow its patterns (where metadata lives, components, i18n setup).
- Structured data must match visible text. Use types Google supports for rich results; no "AI schema"; llms.txt is not a Google requirement.
- Indexable content must be in the initial HTML: prefer static generation or server rendering over client-only rendering.
- Never change dates without a substantive content change. Never invent facts, reviews, ratings, prices or authors in markup or copy.
- robots.txt AI-crawler rules change only on the approver's explicit choice per agent. Search and user-fetch agents (Googlebot, Bingbot, OAI-SearchBot, ChatGPT-User, Claude-SearchBot, Claude-User, PerplexityBot, Perplexity-User) affect visibility; training-only agents (GPTBot, ClaudeBot, Google-Extended, Applebot-Extended, CCBot, meta-externalagent) do not.
- Hosted platforms change their admin menus: before writing a handoff, confirm the current menu labels in the platform's own help docs (WebFetch) and cite the page.

## Next.js (App Router)

- Title, description, canonical, hreflang: `export const metadata` or `export async function generateMetadata()` in `app/**/page.tsx` or `layout.tsx`; `alternates: { canonical: '/path', languages: { en: '/en/x', ar: '/ar/x' } }`; set `metadataBase` in the root layout.
- Sitemap: `app/sitemap.ts` returning `MetadataRoute.Sitemap`; very large sites use `generateSitemaps`.
- Robots: `app/robots.ts` returning `MetadataRoute.Robots`, including `sitemap`.
- JSON-LD: `<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }} />` in the page. In TypeScript projects type it with `schema-dts` (`import type { WithContext, Product } from 'schema-dts'`); adding the devDependency needs approval.
- Raw-HTML failures: content rendered by `'use client'` components that fetch on the client → fetch in the server component (async page) or render statically with `generateStaticParams`; keep interactivity in small client components.
- Redirects: `redirects()` in `next.config.*` with `permanent: true`, or `permanentRedirect()` in a route.
- Images: `next/image` with meaningful `alt` and `width`/`height` (or `fill` inside a sized parent).

## Next.js (Pages Router)

- `next/head` per page; `getStaticProps` or `getServerSideProps` instead of client fetching for indexable content; sitemap through `pages/sitemap.xml.tsx` exporting a no-op default component plus `getServerSideProps` that writes the XML, or `next-sitemap` only if the project already uses it.

## Astro

- Set `site` in `astro.config.*` (needed for canonicals and the sitemap); `@astrojs/sitemap` integration; head tags in the base layout through props; JSON-LD with `<script type="application/ld+json" set:html={JSON.stringify(data).replace(/</g, '\\u003c')} />`; prefer static output; `client:only` islands must not hold indexable content.

## Nuxt

- With Nuxt SEO (`@nuxtjs/seo`): `useSeoMeta()`, `site.url` in `nuxt.config`, its sitemap and robots modules, `useSchemaOrg()` for JSON-LD. Without it: `useHead()` / `useSeoMeta()`. Server rendering or `nitro.prerender` for indexable routes.

## SvelteKit

- `<svelte:head>` per route; `export const prerender = true` in `+page.ts` or `+layout.ts` for static pages; sitemap from a `+server.ts` route (or `super-sitemap`, with approval); JSON-LD via `{@html '<script type="application/ld+json">' + JSON.stringify(data).replace(/</g, '\\u003c') + '</script>'}` inside `<svelte:head>`.

## Vite SPA (React or Vue without a framework): client-rendered

- Raw-HTML failures here are structural. Options by size of change: (1) build-time prerendering of indexable routes with `vite-prerender-plugin` (any framework) or `vite-ssg` (Vue); (2) React Router framework mode with `prerender` in `react-router.config.ts`; (3) move indexable routes to an SSR/SSG framework (Vike, Next.js, Nuxt, Astro). Propose; do not migrate without approval. Do not add react-snap (unmaintained) or a self-hosted prerender proxy.

## Hugo

- Built-in sitemap (`[sitemap]` config) and robots (`enableRobotsTXT = true`, `layouts/robots.txt`); title and description from front matter in the project's `baseof.html` (`layouts/baseof.html` on Hugo 0.146+, `layouts/_default/baseof.html` before); hreflang through multilingual config and `.AllTranslations` (it includes the current page; `.Translations` does not).

## Jekyll

- `jekyll-seo-tag` (`{% seo %}` in the head) with front matter `title` and `description`; `jekyll-sitemap` for the sitemap.

## Static HTML

- Edit each page's `<head>`; write `sitemap.xml` and `robots.txt` at the root; JSON-LD in a `<script type="application/ld+json">` block; one `<h1>` per page.

## WordPress (handoff: admin steps)

- Use the SEO plugin already installed: Yoast SEO, Rank Math or The SEO Framework (GPL: recommend, never bundle). Titles and descriptions in each post's SEO panel; templates in the plugin's title/meta settings; XML sitemap in the plugin's sitemap setting; Settings → Reading "Discourage search engines" must be off; redirects in the plugin's redirect manager or the Redirection plugin; Organization or LocalBusiness schema in the plugin's schema settings, never two schema plugins at once. WordPress renders on the server; check page builders that inject content with JavaScript.

## Shopify, Wix, Squarespace, Webflow (handoff)

- Shopify: home title and description in Online Store preferences; each product and collection "Search engine listing"; URL redirects in Navigation; `robots.txt.liquid` for robots rules; JSON-LD in the theme.
- Wix: each page's SEO settings; the robots.txt editor and URL redirect manager in SEO settings.
- Squarespace: page Settings → SEO; URL mappings for 301s; code injection for JSON-LD.
- Webflow: page SEO settings; site SEO settings for robots and the auto sitemap; 301 redirects in hosting/publishing settings; custom code embed for JSON-LD.

## hreflang (any stack)

- Every language version lists every version, including itself, plus `x-default` where there is a default or language-selector page; links are reciprocal; codes are ISO 639-1 with optional ISO 3166-1 region (`en`, `ar-AE`); each version's canonical points to itself.
