import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

// Regression test for scriptscat/scriptcat-frontend#66 — "插件描述支持 GFM
// （Github Flavored Markdown）". See
// docs/superpowers/specs/2026-07-31-markdown-gfm-extensions-design.md.
//
// parseMarkdown() (src/components/MarkdownView/parseMarkdown.ts) gained
// marked-alert / marked-footnote / marked-gfm-heading-id support this round,
// and that pure function is covered by vitest unit tests
// (parseMarkdown.test.ts). Those tests only prove the parser's *output
// string* is correct — they never run it through the xss sanitizer's real
// attribute-value filtering, the vendored CSS classes, or an actual browser
// DOM. This spec is the one place that exercises the whole chain: parse +
// sanitize + CSS + client render. Before this round, `> [!IMPORTANT]` on
// this exact fixture rendered the literal marker text into the page (issue
// #66's symptom) — the last assertion below is the one that would have
// failed against that behavior.
//
// Fixture markdown lives in tests/e2e/mock-api.ts (`script.content`), served
// as `/scripts/1` and rendered by the script detail page's "description" tab
// (the first Tabs item, active without any click — see
// ScriptDetailClient.tsx).
//
// Deliberately out of scope: the Toast UI editor preview tab. Its
// inconsistency with the published view was investigated this round and
// accepted as a documented limitation (design note §已知限制,决策 9) — an
// e2e that pinned the preview's current behavior would be pinning something
// already agreed to be wrong.

test.beforeEach(async ({ context }) => {
  await context.addCookies([
    {
      name: 'token',
      value: 'e2e-token',
      domain: '127.0.0.1',
      path: '/',
      httpOnly: true,
      sameSite: 'Lax',
    },
    {
      name: 'login_id',
      value: '1',
      domain: '127.0.0.1',
      path: '/',
      httpOnly: true,
      sameSite: 'Lax',
    },
  ]);
});

async function gotoDescriptionTab(page: Page, locale: string) {
  await page.goto(`/${locale}/script-show-page/1`, { waitUntil: 'commit' });
  // The "description" tab is the first Tabs item in ScriptDetailClient and
  // is active by default, so its MarkdownView renders without any click.
  await expect(page.locator('.markdown-body')).toBeVisible();
}

test.describe('markdown GFM extensions render on the script detail page', () => {
  test('renders a GitHub alert with the localized zh-CN title, plus a second variant', async ({
    page,
  }) => {
    await gotoDescriptionTab(page, 'zh-CN');

    const important = page.locator(
      '.markdown-body .markdown-alert.markdown-alert-important',
    );
    await expect(important).toBeVisible();
    await expect(important.locator('.markdown-alert-title')).toHaveText('重要');

    // A second alert variant must also render — if this spec only asserted
    // on `-important`, a parser that special-cased just that one string
    // could pass it.
    const note = page.locator(
      '.markdown-body .markdown-alert.markdown-alert-note',
    );
    await expect(note).toBeVisible();
    await expect(note.locator('.markdown-alert-title')).toHaveText('说明');
  });

  test('localizes the same alert title in English, proving the label is plumbed through i18n rather than hardcoded', async ({
    page,
  }) => {
    await gotoDescriptionTab(page, 'en');

    const important = page.locator(
      '.markdown-body .markdown-alert.markdown-alert-important',
    );
    await expect(important).toBeVisible();
    await expect(important.locator('.markdown-alert-title')).toHaveText(
      'Important',
    );
  });

  test('renders the footnote section with a reference and back-reference that resolve to each other', async ({
    page,
  }) => {
    await gotoDescriptionTab(page, 'zh-CN');

    // `:has(ol)` picks the *generated* footnotes section: the fixture also
    // contains an author-written `<section class="footnotes">` (see the test
    // below), and that one carries no item list.
    const section = page.locator('.markdown-body section.footnotes:has(ol)');
    await expect(section).toBeVisible();

    // The <sup> reference marker in the body.
    const ref = page.locator('.markdown-body sup a').first();
    await expect(ref).toBeVisible();
    const refHref = await ref.getAttribute('href');
    const refId = await ref.getAttribute('id');
    expect(refHref, 'reference anchor must have an href').toBeTruthy();
    expect(refId, 'reference anchor must have an id').toBeTruthy();

    // Forward direction: the reference's href must resolve to a footnote
    // item that actually exists inside the footnotes section.
    const itemId = (refHref as string).replace(/^#/, '');
    const item = section.locator(`li[id="${itemId}"]`);
    await expect(item).toHaveCount(1);

    // Backward direction: the item's back-reference (↩) anchor href must
    // resolve back to the reference anchor's own id. Both ids/hrefs are
    // derived independently (from the same source label, via
    // encodeURIComponent, on two different marked-footnote call sites) —
    // this is exactly the property that regressed twice this round (see the
    // history of parseMarkdown.ts's footnote label handling / commit
    // 154ace5's "两端都由同一个 label 经 encodeURIComponent 推导 id/href，
    // 因而锚点仍然对得上").
    const backref = item.locator('a[href^="#"]').last();
    await expect(backref).toBeVisible();
    const backrefHref = await backref.getAttribute('href');
    expect(backrefHref).toBe(`#${refId}`);
  });

  // The hiding rule for the generated footnotes heading (markdown.css) used to
  // match *any* `<h2>` inside *any* `section.footnotes`. `section` is in the
  // sanitizer's tag allowlist and `footnotes` is in STRUCTURE_CLASSES, so an
  // author could wear that shape in raw HTML and have their own heading
  // clipped to 1×1 — text a human reviewer never sees while it stays in the
  // DOM and in the page source for crawlers.
  test('hides the generated footnotes heading without hiding an author-written <h2> in their own section.footnotes', async ({
    page,
  }) => {
    await gotoDescriptionTab(page, 'zh-CN');

    // A 1×1 clipped element still passes `toBeVisible()` (non-empty box, no
    // `visibility: hidden`), so both directions are asserted by size.
    const generated = page.locator(
      '.markdown-body section.footnotes > h2#user-content-fn-label',
    );
    await expect(generated).toHaveCount(1);
    const generatedBox = await generated.boundingBox();
    expect(generatedBox?.height).toBeLessThanOrEqual(1);

    const authored = page.locator('.markdown-body section.footnotes > h2', {
      hasText: '作者自己写的脚注标题',
    });
    await expect(authored).toHaveCount(1);
    const authoredBox = await authored.boundingBox();
    expect(authoredBox?.height).toBeGreaterThan(10);
  });

  test('gives a heading a slug id and links to it in-page, without target="_blank"', async ({
    page,
  }) => {
    await gotoDescriptionTab(page, 'zh-CN');

    const heading = page.locator('.markdown-body #安装说明');
    await expect(heading).toBeVisible();
    await expect(heading).toHaveText('安装说明');

    const anchor = page.locator('.markdown-body a[href="#安装说明"]');
    await expect(anchor).toBeVisible();
    await expect(anchor).not.toHaveAttribute('target', '_blank');
  });

  test('does not leak the literal [!IMPORTANT] marker into the rendered description', async ({
    page,
  }) => {
    await gotoDescriptionTab(page, 'zh-CN');

    // This is issue #66's exact symptom: before this round, an unrecognized
    // GitHub alert marker rendered as literal blockquote text instead of a
    // styled alert box.
    const text = await page.locator('.markdown-body').innerText();
    expect(text).not.toContain('[!IMPORTANT]');
    expect(text).not.toContain('[!NOTE]');
  });
});
