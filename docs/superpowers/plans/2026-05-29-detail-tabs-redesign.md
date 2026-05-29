# Script Detail Tabs Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle the four tabs on the script detail page (描述 / 版本 / 评分 / 权限说明) to match the approved Pencil mockups in `scriptlist-chips-design.pen` — count chips in the tab bar, a de-boxed version list with collapsible changelogs, a calmer ratings overview with a collapse-then-expand rating form and highlighted author replies, and a flat de-boxed permissions (metadata) tab.

**Architecture:** Pure frontend (Next.js + AntD 6 + Tailwind 4). All four tab bodies already render embedded inside `ScriptDetailClient`'s `<Tabs>`. We restyle the existing components in place — no API, routing, or data-flow changes. Edit/Delete version management and the edit Modal are preserved exactly. The "metadata" tab is renamed to "权限说明 / Permissions" via translations only (the tab key / component name stays `metadata`).

**Tech Stack:** TypeScript, React 19, Ant Design 6 (`Tabs`, `Rate`, `Badge`, `Tag`, `Button`, `Modal`), Tailwind CSS 4 (GitHub-style tokens, `dark:` variants), `next-intl`.

**Verification note:** This repo has **no frontend unit-test runner** (only ESLint). So instead of TDD, each task is verified by `pnpm lint` (zero new warnings/errors) plus a visual check in `pnpm dev`, with a final `pnpm build`. Translations are edited directly per project convention (no Crowdin).

**Branch:** Current branch is `release/hotfix`. Before Task 1, create a feature branch:
```bash
cd scriptlist-frontend && git checkout -b feat/detail-tabs-redesign
```

**Design reference (decisions locked in brainstorming):**
- Tab bar: label + small rounded count chip for 版本/评分; AntD line-tabs already give the active primary text + underline + 1px hairline.
- 版本: light stats strip (`共 N 个版本` + 正式/预发布 dot-chips + pagination) → single container, **hairline-separated rows** (not card-per-item); changelog = **collapsible** (clamp 2 lines + 展开全部/收起); buttons = 安装(primary)+查看代码 left, 对比 icon-only right.
- 评分: overview = neutral surface + amber accent (drop the gradient); rating form = **collapsed bar that expands on first star click**; comments = hairline-separated rows; author reply highlighted (light-blue tint + left primary accent + "✓ 作者" badge).
- 权限说明: flat hairline-separated sections (color-coded directive chip + title + 1-line desc; each value = inline code chip + plain explanation). No nested cards.

---

## File Structure

- `public/locales/<6 locales>/translations.json` — rename `script.detail.tabs.metadata`; add version/rating keys. (Task 1)
- `src/app/[locale]/(main)/script-show-page/[id]/components/ScriptDetailClient.tsx` — tab labels with count chips; description reading width. (Task 2)
- `src/app/[locale]/(main)/script-show-page/[id]/version/components/ScriptVersionsClient.tsx` — stats strip, hairline rows, collapsible changelog, button layout; preserve Edit/Delete + Modal. (Task 3)
- `src/app/[locale]/(main)/script-show-page/[id]/comment/components/rating/RatingOverview.tsx` — calmer overview. (Task 4)
- `.../rating/UserRatingForm.tsx` — collapse-then-expand form. (Task 5)
- `.../rating/RatingList.tsx`, `RatingItem.tsx`, `ReplyItem.tsx` — hairline rows + author-reply highlight. (Task 6)
- `src/app/[locale]/(main)/script-show-page/[id]/components/ScriptMetadataExplainer.tsx` — flat de-boxed sections. (Task 7)

The 6 locale directories: `zh-CN`, `zh-TW`, `en-US`, `ja-JP`, `ru-RU`, `de-DE`. zh-CN is primary (set first).

---

## Task 1: Translations — rename metadata tab + add new keys

**Files:**
- Modify: `public/locales/zh-CN/translations.json` (primary)
- Modify: `public/locales/{zh-TW,en-US,ja-JP,ru-RU,de-DE}/translations.json`

- [ ] **Step 1: Rename `script.detail.tabs.metadata` in all 6 locales**

Set `script.detail.tabs.metadata`:
| locale | value |
|---|---|
| zh-CN | `权限说明` |
| zh-TW | `權限說明` |
| en-US | `Permissions` |
| ja-JP | `権限の説明` |
| ru-RU | `Разрешения` |
| de-DE | `Berechtigungen` |

- [ ] **Step 2: Add new `script.version` keys in all 6 locales**

Add under `script.version`:
```jsonc
"version_count": "共 {count} 个版本",
"release_chip": "正式 {count}",
"prerelease_chip": "预发布 {count}",
"expand_changelog": "展开全部",
"collapse_changelog": "收起"
```
Translations:
- en-US: `"Total {count} versions"`, `"Stable {count}"`, `"Pre-release {count}"`, `"Show all"`, `"Collapse"`
- zh-TW: `"共 {count} 個版本"`, `"正式 {count}"`, `"預發佈 {count}"`, `"展開全部"`, `"收起"`
- ja-JP: `"全 {count} バージョン"`, `"正式版 {count}"`, `"プレリリース {count}"`, `"すべて表示"`, `"折りたたむ"`
- ru-RU: `"Всего версий: {count}"`, `"Стабильные {count}"`, `"Предрелизные {count}"`, `"Показать всё"`, `"Свернуть"`
- de-DE: `"{count} Versionen insgesamt"`, `"Stabil {count}"`, `"Vorabversion {count}"`, `"Alle anzeigen"`, `"Einklappen"`

- [ ] **Step 3: Add new `script.rating.user_form` keys in all 6 locales**

Add under `script.rating.user_form`:
```jsonc
"collapsed_prompt": "为这个脚本评分",
"collapsed_hint": "点击星标开始评价"
```
Translations:
- en-US: `"Rate this script"`, `"Tap a star to start"`
- zh-TW: `"為這個腳本評分"`, `"點擊星標開始評價"`
- ja-JP: `"このスクリプトを評価"`, `"星をタップして開始"`
- ru-RU: `"Оцените этот скрипт"`, `"Нажмите на звезду, чтобы начать"`
- de-DE: `"Dieses Skript bewerten"`, `"Zum Starten Stern antippen"`

- [ ] **Step 4: Validate JSON + lint**

Run: `node -e "['zh-CN','zh-TW','en-US','ja-JP','ru-RU','de-DE'].forEach(l=>JSON.parse(require('fs').readFileSync('public/locales/'+l+'/translations.json','utf8')))" && echo OK`
Expected: `OK` (all parse).

- [ ] **Step 5: Commit**
```bash
git add public/locales
git commit -m "i18n(detail-tabs): rename metadata tab to 权限说明, add version/rating keys"
```

---

## Task 2: Tab labels with count chips + description reading width

**Files:**
- Modify: `src/app/[locale]/(main)/script-show-page/[id]/components/ScriptDetailClient.tsx` (the `detailTabs` useMemo, ~lines 562–619, and the description tab body)

- [ ] **Step 1: Add a `CountChip` helper near the top of the file (after imports, before the component)**
```tsx
function CountChip({ value }: { value: number }) {
  return (
    <span className="ml-1.5 inline-flex items-center rounded-full bg-gray-100 px-1.5 text-xs font-medium text-gray-500 dark:bg-gray-700 dark:text-gray-400">
      {value}
    </span>
  );
}
```

- [ ] **Step 2: Update the `description` and `versions`/`ratings` tab labels in `detailTabs`**

Description body — constrain reading width (replace `max-w-none`):
```tsx
{
  key: 'description',
  label: t('tabs.description'),
  children: (
    <div className="prose prose-sm max-w-3xl dark:prose-invert">
      <MarkdownView id="readme" content={content} />
    </div>
  ),
},
```
Versions label (replace the template-string label):
```tsx
label: (
  <span className="inline-flex items-center">
    {t('tabs.versions')}
    <CountChip value={initialVersionData?.total ?? 0} />
  </span>
),
```
Ratings label:
```tsx
label: (
  <span className="inline-flex items-center">
    {t('tabs.ratings')}
    <CountChip value={initialRatingStats.totalRatings} />
  </span>
),
```
Metadata label stays `t('tabs.metadata')` (value now "权限说明" from Task 1).

- [ ] **Step 3: Give the `<Tabs>` a larger, evenly-spaced bar (the card wrapping it is at ~line 1209)**
```tsx
<Card className="shadow-sm">
  <Tabs items={detailTabs} size="large" />
</Card>
```

- [ ] **Step 4: Lint + visual check**

Run: `pnpm lint`
Expected: no new errors/warnings.
Visual (`pnpm dev` → a script detail page): tab bar shows `描述 · 版本 (12) · 评分 (48) · 权限说明`, count chips rounded/subtle, active tab primary with underline; description column is reading-width.

- [ ] **Step 5: Commit**
```bash
git add src/app/\[locale\]/\(main\)/script-show-page/\[id\]/components/ScriptDetailClient.tsx
git commit -m "feat(detail-tabs): count chips in tab bar + reading-width description"
```

---

## Task 3: Versions tab redesign

**Files:**
- Modify: `src/app/[locale]/(main)/script-show-page/[id]/version/components/ScriptVersionsClient.tsx`

Keep all existing handlers/state (`handleEdit`, `handleDelete`, `handleVersionSelect`, pagination, the edit `Modal`, loading/error/empty branches). Only the embedded `content` block (currently lines ~322–498: stats block + version-card list) is restructured. Edit/Delete are preserved as small icon buttons in each row header.

- [ ] **Step 1: Extract a `VersionRow` component (collapsible changelog) above the default export**
```tsx
function VersionChangelog({ changelog }: { changelog: string }) {
  const t = useTranslations('script.version');
  const ref = React.useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [overflowing, setOverflowing] = useState(false);
  React.useEffect(() => {
    const el = ref.current;
    if (el) setOverflowing(el.scrollHeight > el.clientHeight + 4);
  }, [changelog]);
  return (
    <div className="border-l-[3px] border-gray-200 pl-3 dark:border-gray-700">
      <div
        ref={ref}
        className={expanded ? '' : 'line-clamp-2 overflow-hidden'}
      >
        <MarkdownView content={changelog} />
      </div>
      {(overflowing || expanded) && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
        >
          {expanded ? t('collapse_changelog') : t('expand_changelog')}
          {expanded ? <UpOutlined className="text-xs" /> : <DownOutlined className="text-xs" />}
        </button>
      )}
    </div>
  );
}
```
Add `UpOutlined, DownOutlined` to the `@ant-design/icons` import. (`React` is already imported.)

- [ ] **Step 2: Replace the stats block (current lines ~336–370) with a light stats strip**
```tsx
{/* 版本统计信息 */}
<div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-gray-50 px-4 py-3 dark:bg-gray-800/60">
  <div className="flex flex-wrap items-center gap-3">
    <span className="font-semibold text-gray-900 dark:text-gray-100">
      {t('version_count', { count: totalVersions })}
    </span>
    <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-300">
      <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
      {t('release_chip', { count: releaseCount })}
    </span>
    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
      {t('prerelease_chip', { count: preReleaseCount })}
    </span>
  </div>
  <span className="text-sm text-gray-500">
    {t('pagination_info', {
      start: (currentPage - 1) * pageSize + 1,
      end: Math.min(currentPage * pageSize, totalVersions),
      total: totalVersions,
    })}
  </span>
</div>
```

- [ ] **Step 3: Replace the version-card list (current lines ~372–498) with hairline-separated rows**

Container = `divide-y` instead of card-per-item:
```tsx
{/* 版本列表 */}
<div className="divide-y divide-gray-100 dark:divide-gray-800">
  {versions.map((version: ScriptVersion, index: number) => {
    const globalIndex = (currentPage - 1) * pageSize + index;
    return (
      <div key={version.id} className="space-y-3 py-5 first:pt-0">
        {/* 头部：版本号 + 徽标 / 日期 + 管理按钮 */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span className="rounded-md bg-gray-100 px-2.5 py-1 font-mono text-sm font-semibold text-gray-800 dark:bg-gray-800 dark:text-gray-200">
              {version.version}
            </span>
            {getVersionBadge(version, globalIndex)}
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <CalendarOutlined />
            <span className="text-xs">{semDateTime(version.createtime)}</span>
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEdit(version)}
              className="!text-gray-500"
            />
            <Popconfirm
              title={t('confirm_delete_title')}
              description={t('confirm_delete_description')}
              onConfirm={() => handleDelete(version)}
              okText={t('confirm_delete_ok')}
              cancelText={t('confirm_delete_cancel')}
              okType="danger"
            >
              <Button type="text" size="small" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </div>
        </div>

        {/* changelog（可折叠） */}
        {version.changelog && <VersionChangelog changelog={version.changelog} />}

        {/* 操作：安装/查看代码 左，对比 图标 右 */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-wrap gap-2">
            <Button
              type="primary"
              size="small"
              icon={<DownloadOutlined />}
              href={
                '/scripts/code/' +
                script.id +
                '/' +
                encodeURIComponent(script.name) +
                '.user.js?version=' +
                version.version
              }
            >
              {t('install_button')}
            </Button>
            <Link href={`/script-show-page/${script.id}/code?version=${version.version}`}>
              <Button size="small" icon={<CodeOutlined />}>
                {t('view_code_button')}
              </Button>
            </Link>
          </div>
          <Tooltip title={t('compare_button')}>
            <Button
              size="small"
              color={selectedVersions.includes(version.version) ? 'primary' : 'default'}
              variant="outlined"
              icon={<DiffOutlined />}
              onClick={() => handleVersionSelect(version)}
              disabled={
                selectedVersions.length >= 2 &&
                !selectedVersions.includes(version.version)
              }
            />
          </Tooltip>
        </div>
      </div>
    );
  })}
</div>
```
Add `Tooltip` to the `antd` import. Remove the now-unused `TagOutlined`, `Divider`, and `Card` (inner) usages if they become unused — run lint to confirm. Keep `Card` import (still used by non-embedded wrapper and loading/error states).

- [ ] **Step 4: Lint + visual check**

Run: `pnpm lint`
Expected: no new errors/warnings (fix any "unused import" by removing `TagOutlined`/`Divider` if lint flags them).
Visual: 版本 tab shows the light strip, hairline-separated rows, version chip + 最新/预发布 badge, date + edit/delete icons on the right, changelog clamped to 2 lines with 展开全部 on long ones, 安装+查看代码 left / 对比 icon right. Edit Modal still opens and saves.

- [ ] **Step 5: Commit**
```bash
git add src/app/\[locale\]/\(main\)/script-show-page/\[id\]/version/components/ScriptVersionsClient.tsx
git commit -m "feat(detail-tabs): de-boxed version list with collapsible changelog"
```

---

## Task 4: Ratings overview — calmer surface

**Files:**
- Modify: `src/app/[locale]/(main)/script-show-page/[id]/comment/components/rating/RatingOverview.tsx`

- [ ] **Step 1: Replace the amber-gradient wrapper with a neutral surface + amber accents**

Change the outer wrapper (line 11) from the amber gradient to:
```tsx
<div className="rounded-xl border border-gray-100 bg-gray-50 p-6 dark:border-gray-800 dark:bg-gray-800/50">
```
Keep the two-column grid. The big score number stays amber (`text-amber-600 dark:text-amber-400`), the `Rate` stays, distribution bars keep the amber `strokeColor`. Only the container surface changes (gradient → flat neutral). Everything else in the file is unchanged.

- [ ] **Step 2: Lint + visual check**

Run: `pnpm lint`
Expected: clean.
Visual: 评分 tab overview is a calm gray panel; score/stars/bars still amber. No gradient.

- [ ] **Step 3: Commit**
```bash
git add src/app/\[locale\]/\(main\)/script-show-page/\[id\]/comment/components/rating/RatingOverview.tsx
git commit -m "feat(detail-tabs): calmer ratings overview surface"
```

---

## Task 5: Rating form — collapse-then-expand

**Files:**
- Modify: `src/app/[locale]/(main)/script-show-page/[id]/comment/components/rating/UserRatingForm.tsx`

Keep the `!user` login-prompt branch and the `existingRating && !isEditing` "your review" branch as-is (light restyle optional). Add a **collapsed bar** for the new-rating case.

- [ ] **Step 1: Add `expanded` state and a collapsed bar before the full form**

After the existing `const [isEditing, setIsEditing] = useState(false);` add:
```tsx
const [expanded, setExpanded] = useState(false);
```
Then, in the "show form" return (currently line ~192, the new-or-edit form), guard it so that for a brand-new rating that hasn't been started we render a collapsed bar instead:
```tsx
// 收起态：未登录评分、尚未展开 → 一行评分入口
if (!existingRating && !expanded) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-gray-50 px-4 py-3 dark:bg-gray-800/50">
      <div className="flex items-center gap-3">
        <span className="font-semibold text-gray-900 dark:text-gray-100">
          {t('collapsed_prompt')}
        </span>
        <Rate
          value={userRating}
          character={<StarFilled />}
          onChange={(v) => {
            setUserRating(v);
            setExpanded(true);
          }}
          className="text-2xl"
        />
      </div>
      <span className="text-sm text-gray-500">{t('collapsed_hint')}</span>
    </div>
  );
}
```
(Place this right before the final `return (` of the full form.)

- [ ] **Step 2: Make "取消/重置" collapse the bar again**

In `handleCancel`, when there is no existing rating, also collapse:
```tsx
const handleCancel = () => {
  if (existingRating) {
    setUserRating(existingRating.score / 10);
    setUserComment(existingRating.message);
    setIsEditing(false);
  } else {
    setUserRating(0);
    setUserComment('');
    setExpanded(false);
  }
};
```
And after a successful new submission in `handleSubmit`, add `setExpanded(false);` alongside the existing resets.

- [ ] **Step 3: Lint + visual check**

Run: `pnpm lint`
Expected: clean.
Visual: with no prior rating, 评分 tab shows a one-line "为这个脚本评分 ☆☆☆☆☆ 点击星标开始评价"; clicking a star expands the comment box + submit; 重置 collapses it again; users with an existing rating still see their review card.

- [ ] **Step 4: Commit**
```bash
git add src/app/\[locale\]/\(main\)/script-show-page/\[id\]/comment/components/rating/UserRatingForm.tsx
git commit -m "feat(detail-tabs): collapse-then-expand rating form"
```

---

## Task 6: Rating list / item / reply — hairline rows + author highlight

**Files:**
- Modify: `.../rating/RatingList.tsx`, `.../rating/RatingItem.tsx`, `.../rating/ReplyItem.tsx`

- [ ] **Step 1: `RatingList` — header + hairline-separated rows (replace card-per-item)**

Replace the title `<h2 ... text-2xl>` with a lighter header row:
```tsx
<div className="flex flex-wrap items-center justify-between gap-3">
  <div className="flex items-baseline gap-2">
    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
      {t('title')}
    </h2>
    <span className="font-mono text-sm text-gray-500">{ratings.length}</span>
  </div>
  {/* keep the existing Select sort control */}
</div>
```
Replace the list wrapper `<div className="flex flex-col space-y-4 gap-4">` with a `divide-y` container:
```tsx
<div className="divide-y divide-gray-100 dark:divide-gray-800">
  {ratings.map((rating) => (<RatingItem key={rating.id} ... />))}
</div>
```
Keep the load-more / loading / all-loaded block.

- [ ] **Step 2: `RatingItem` — drop the per-item `Card`, render as a row**

Replace the outer `<Card size="small" ...>` + inner `<div className="p-6">` with a plain row:
```tsx
<div className="py-5 first:pt-0">
```
Keep the avatar + name + `Rate` + time header, the message body, the reply box, and the `ReplyItem` render. Remove the `pl-16` deep indents in favor of a tighter `pl-12`/`pl-13` so replies align under the body (avatar is `size="large"` ≈ 40px). Remove the now-unused `Card`/`Divider` imports (run lint).

- [ ] **Step 3: `ReplyItem` — highlight author replies**

Replace the wrapper (line 15) and the author tag block so author replies get a light-blue tint + left primary accent + a check badge:
```tsx
<div className="rounded-lg border-l-[3px] border-blue-500 bg-blue-50 p-3 dark:bg-blue-950/30">
```
And render the author badge with an icon (replace the plain `Tag` for `is_author === 1`):
```tsx
{reply.is_author === 1 && (
  <Tag
    icon={<CheckCircleFilled />}
    className="!m-0 border-0 bg-blue-600 px-2 py-0 text-xs text-white"
  >
    {t('author_tag')}
  </Tag>
)}
```
Add `CheckCircleFilled` to the `@ant-design/icons` import. The `is_admin` red tag is unchanged.

- [ ] **Step 4: Lint + visual check**

Run: `pnpm lint`
Expected: clean (remove any unused `Card`/`Divider`/`StarFilled` imports flagged).
Visual: comments are hairline-separated rows (no per-item cards); an author reply shows the blue-tinted block with the "✓ 作者" badge; the normal reply box/flow still works.

- [ ] **Step 5: Commit**
```bash
git add src/app/\[locale\]/\(main\)/script-show-page/\[id\]/comment/components/rating
git commit -m "feat(detail-tabs): hairline comment rows + highlighted author reply"
```

---

## Task 7: Permissions (metadata) tab — flat de-boxed sections

**Files:**
- Modify: `src/app/[locale]/(main)/script-show-page/[id]/components/ScriptMetadataExplainer.tsx`

- [ ] **Step 1: Add a per-directive color map (after the `MetadataSection` interface)**
```tsx
const sectionColor: Record<string, string> = {
  grant: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  match: 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  include: 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  exclude: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  connect: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
  run_at: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
};
const defaultColor =
  'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
```

- [ ] **Step 2: Replace the section render (current lines ~226–259) with flat hairline sections**
```tsx
return (
  <div className="divide-y divide-gray-100 dark:divide-gray-800">
    <Paragraph type="secondary" className="!mb-0 pb-4">
      {t('intro')}
    </Paragraph>
    {sections.map((section) => (
      <div key={section.key} className="space-y-3 py-4">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`rounded-md px-2 py-0.5 font-mono text-sm font-semibold ${
              sectionColor[section.key] ?? defaultColor
            }`}
          >
            {section.directive}
          </span>
          <Text strong>{section.title}</Text>
        </div>
        <Paragraph type="secondary" className="!mb-0 text-sm">
          {section.description}
        </Paragraph>
        <div className="space-y-2.5">
          {section.items.map((item, index) => (
            <div
              key={`${section.key}-${index}-${item.value}`}
              className="flex flex-col gap-1 sm:flex-row sm:items-start sm:gap-3"
            >
              <code className="inline-block w-fit break-all rounded bg-gray-100 px-2 py-0.5 font-mono text-sm text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                {item.value}
              </code>
              <Text type="secondary" className="text-sm leading-relaxed">
                {item.description}
              </Text>
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
);
```
The empty-state branch (no sections) is unchanged. Remove the now-unused `Tag` import.

- [ ] **Step 3: Lint + visual check**

Run: `pnpm lint`
Expected: clean.
Visual: 权限说明 tab is flat — color-coded directive chips (`@grant` blue, `@match` green, `@connect` indigo, `@run-at` amber, `@require` neutral), each value as an inline code chip + muted explanation, sections split by hairlines, no nested boxes.

- [ ] **Step 4: Commit**
```bash
git add src/app/\[locale\]/\(main\)/script-show-page/\[id\]/components/ScriptMetadataExplainer.tsx
git commit -m "feat(detail-tabs): de-box permissions (metadata) tab"
```

---

## Final verification

- [ ] **Step 1: Full lint**

Run: `pnpm lint`
Expected: no errors; no new warnings beyond the repo's pre-existing baseline.

- [ ] **Step 2: Production build**

Run: `pnpm build`
Expected: build succeeds (no type errors).

- [ ] **Step 3: Visual sweep across all 4 tabs in light + dark**

In `pnpm dev`, open a script detail page; toggle theme; confirm each tab matches the mockup and there is no layout breakage on a narrow (mobile) viewport.

---

## Self-Review notes

- **Spec coverage:** tab count chips (T2) ✓; description reading width (T2) ✓; version stats strip + hairline rows + collapsible changelog + button layout (T3) ✓; ratings overview de-gradient (T4) ✓; collapse-then-expand form (T5) ✓; hairline comments + author-reply highlight (T6) ✓; de-boxed permissions tab + rename (T1, T7) ✓.
- **Preserved behavior:** version Edit/Delete + edit Modal, pagination, version compare navigation, infinite-scroll comment loading, reply/delete flows, login prompt — all untouched functionally.
- **Out of scope (no regression introduced):** version Edit/Delete remain visible to all users exactly as in the current embedded implementation; gating them behind a manager permission is a separate change.
- **Type consistency:** no prop/signature changes — only JSX/Tailwind and two new local states (`expanded` in UserRatingForm, `expanded`/`overflowing` in VersionChangelog) and one new local component (`CountChip`, `VersionChangelog`).
