import { createServer } from 'node:http';
import type { IncomingMessage, ServerResponse } from 'node:http';

const port = Number(process.env.E2E_API_PORT || 3101);
const now = Math.floor(Date.now() / 1000);

const user = {
  user_id: 1,
  id: 1,
  username: 'e2e-user',
  avatar: 'https://scriptcat.org/assets/logo.png',
  is_admin: 1,
  status: 1,
  badge: [],
  description: 'E2E fixture user',
  join_time: now - 86_400,
  last_active: now,
  location: 'Local',
  website: 'https://scriptcat.org',
  email: 'e2e@example.com',
  is_follow: false,
  followers: 1,
  following: 1,
};

const category = {
  id: 1,
  name: '工具',
  num: 1,
  sort: 1,
  type: 1,
  createtime: now - 1000,
  updatetime: now,
};

const script = {
  id: 1,
  user_id: 1,
  username: user.username,
  avatar: user.avatar,
  is_admin: 1,
  post_id: 1,
  name: 'E2E Userscript',
  description: 'A deterministic script fixture for local e2e tests.',
  category,
  tags: [category],
  status: 1,
  score: 5,
  score_num: 1,
  type: 1,
  public: 1,
  unwell: 2,
  archive: 2,
  danger: 2,
  enable_pre_release: 2,
  today_install: 3,
  total_install: 120,
  createtime: now - 10_000,
  updatetime: now,
  // GFM extensions exercised end-to-end by markdown-gfm.spec.ts (alerts,
  // footnotes, heading anchors) — see
  // docs/superpowers/specs/2026-07-31-markdown-gfm-extensions-design.md.
  content:
    '## E2E Userscript\n\n' +
    'This content is served by the Playwright mock API.\n\n' +
    '## 安装说明\n\n' +
    '跳转到 [安装说明](#安装说明) 查看详情。\n\n' +
    '> [!IMPORTANT]\n' +
    '> 有且仅有以上3种分发渠道由仓库维护者直接管理。\n\n' +
    '> [!NOTE]\n' +
    '> 这是来自 GitHub Flavored Markdown 的提示。\n\n' +
    '支持脚注引用[^1]。\n\n' +
    // Author-written raw HTML wearing the footnotes section's own shape. Both
    // `section` and `class="footnotes"` survive sanitization (see
    // parseMarkdown.ts STRUCTURE_CLASSES), so the CSS that visually hides the
    // *generated* footnotes heading must not hide this one — markdown-gfm.spec
    // asserts it stays at full height.
    '<section class="footnotes"><h2>作者自己写的脚注标题</h2><p>作者自己写的脚注正文。</p></section>\n\n' +
    '[^1]: 这是脚注的详细说明内容。\n',
  role: 'owner',
  script: {
    id: 1,
    user_id: 1,
    username: user.username,
    avatar: user.avatar,
    is_admin: 1,
    meta_json: {
      name: ['E2E Userscript'],
      namespace: ['https://scriptcat.org/e2e'],
      version: ['1.0.0'],
      description: ['A deterministic script fixture for local e2e tests.'],
      match: ['https://example.com/*'],
      grant: ['none'],
    },
    script_id: 1,
    version: '1.0.0',
    changelog: 'Initial e2e fixture',
    is_pre_release: 2,
    status: 1,
    createtime: now - 10_000,
    code: [
      '// ==UserScript==',
      '// @name E2E Userscript',
      '// @namespace https://scriptcat.org/e2e',
      '// @version 1.0.0',
      '// @match https://example.com/*',
      '// ==/UserScript==',
      'console.log("e2e");',
    ].join('\n'),
  },
};

const issue = {
  id: 1,
  user_id: 1,
  avatar: user.avatar,
  title: 'E2E issue',
  content: 'Issue content from the mock API.',
  username: user.username,
  labels: ['bug'],
  status: 1,
  createtime: now - 600,
  updatetime: now,
  comment_count: 1,
};

const report = {
  id: 1,
  user_id: 1,
  avatar: user.avatar,
  username: user.username,
  script_id: 1,
  reason: 'spam',
  content: 'Report content from the mock API.',
  status: 1,
  createtime: now - 500,
  updatetime: now,
  comment_count: 1,
};

// 脚本删除后举报历史仍对参与方开放的固定数据。注意真实后端对已删除脚本的
// /scripts/:id 一律 404（连脚本名都不返回），mock 必须照做，否则测不到
// layout 里那条「404 时把渲染让给举报详情」的分支。
const DELETED_SCRIPT_ID = 6240;
const DELETED_REPORT_ID = 151;
const deletedReport = {
  ...report,
  id: DELETED_REPORT_ID,
  script_id: DELETED_SCRIPT_ID,
  content: '这是脚本删除后的历史举报内容。',
};

const pairDetail = {
  id: 1,
  script_a: {
    id: 1,
    name: 'E2E Userscript A',
    user_id: 1,
    username: user.username,
    public: 1,
    createtime: now - 1000,
    is_deleted: false,
    script_code_id: 1,
    version: '1.0.0',
    code_created_at: now - 900,
  },
  script_b: {
    id: 2,
    name: 'E2E Userscript B',
    user_id: 1,
    username: user.username,
    public: 1,
    createtime: now - 800,
    is_deleted: false,
    script_code_id: 2,
    version: '1.0.0',
    code_created_at: now - 700,
  },
  jaccard: 0.9,
  common_count: 12,
  a_fp_count: 20,
  b_fp_count: 20,
  earlier_side: 'A',
  detected_at: now - 100,
  code_a: script.script.code,
  code_b: script.script.code.replace('e2e', 'e2e-b'),
  match_segments: [{ a_start: 1, a_end: 4, b_start: 1, b_end: 4 }],
  status: 1,
  review_note: '',
  admin_actions: { can_whitelist: true },
};

const list = <T>(item: T, total = 1) => ({ list: total ? [item] : [], total });

// 版本列表的一行
const versionItem = (id: number, version: string) => ({
  id,
  user_id: 1,
  username: user.username,
  avatar: user.avatar,
  meta_json: script.script.meta_json,
  script_id: 1,
  version,
  changelog: 'Initial e2e fixture',
  is_pre_release: 2,
  status: 1,
  createtime: now - 1000 * id,
  code: script.script.code,
  definition: '',
});
const MANY_VERSIONS_SCRIPT_ID = 240;
const MANY_VERSIONS_TOTAL = 240;
const ok = (data: unknown) => ({ code: 0, msg: 'ok', data });

// ==================== 管理后台列表固定数据 ====================
// 每个管理列表返回 8 行形状真实、长短与状态各异的数据，窄屏卡片 e2e 按行数断言卡片数。
// total 大于一页，卡片分页器有第 2、3 页可点（mock 不按 page 返回不同的行）。
const ADMIN_ROWS = 8;
const ADMIN_TOTAL = 48;
const adminList = <T>(make: (i: number) => T) => ({
  list: Array.from({ length: ADMIN_ROWS }, (_, i) => make(i)),
  total: ADMIN_TOTAL,
});
const pick = <T>(values: readonly T[], i: number) => values[i % values.length];

const ADMIN_USERNAMES = [
  user.username,
  '言小溪enncy',
  'WhiteNight',
  'cat_lover',
  '路人甲',
  'dev_zhang',
  'kitten6660318',
  '小明',
] as const;
const ADMIN_SCRIPT_NAMES = [
  'OCS 网课助手',
  '哔哩哔哩播放页增强：倍速、宽屏、自动跳过片头片尾与弹幕关键词屏蔽一键切换',
  'GitHub 中文化',
  '知乎去广告',
  '超星学习通 | 智慧树 | 职教云 自动刷课与题库答题助手（支持多平台、多题型）',
  '网盘直链下载助手',
  'Bypass paywalls for news sites and academic journals — keeps your reading flow uninterrupted',
  '小说阅读模式',
] as const;
const adminUserId = (i: number) => (i === 0 ? 1 : 100 + i);
const adminScriptId = (i: number) => i + 1;
const adminScriptBrief = (i: number, deleted = false) => ({
  id: adminScriptId(i),
  name: pick(ADMIN_SCRIPT_NAMES, i),
  user_id: adminUserId(i),
  username: pick(ADMIN_USERNAMES, i),
  public: pick([1, 1, 2, 1, 3], i),
  createtime: now - (i + 1) * 86_400 * 7,
  is_deleted: deleted,
});

/** route() 用它表达非 200 响应；handler 会拆开成真正的 HTTP 状态码。 */
const HTTP_ERROR = '__httpError' as const;
const httpError = (status: number, msg: string) => ({
  [HTTP_ERROR]: { status, msg },
});
const isHttpError = (
  payload: unknown,
): payload is { __httpError: { status: number; msg: string } } =>
  typeof payload === 'object' && payload !== null && HTTP_ERROR in payload;

function send(res: ServerResponse, status: number, data: unknown) {
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'access-control-allow-origin': '*',
    'access-control-allow-headers': '*',
    'access-control-allow-methods': 'GET,POST,PUT,DELETE,OPTIONS',
  });
  res.end(JSON.stringify(data));
}

function route(
  pathname: string,
  method: string,
  searchParams: URLSearchParams,
) {
  if (method !== 'GET') {
    if (pathname.includes('/sessions')) {
      return { id: 1, title: 'E2E chat', createtime: now, updatetime: now };
    }
    if (pathname.includes('/reports')) return report;
    if (pathname.includes('/issues')) return issue;
    if (pathname.includes('/oauth-apps')) {
      return { id: 1, client_id: 'client-e2e', client_secret: 'secret-e2e' };
    }
    if (pathname.includes('/review') || pathname.includes('/scan')) {
      return { queued_from: 1, script_id: 1, script_code_id: 1 };
    }
    return {};
  }

  if (pathname === '/healthz') return { ok: true };
  if (pathname === '/global-config') {
    return {
      turnstile_site_key: '1x00000000000000000000AA',
      qq_migrate_enabled: true,
    };
  }
  if (pathname === '/users') return user;
  if (/^\/users\/\d+\/detail$/.test(pathname)) return user;
  if (pathname === '/users/search') {
    return { users: [{ user_id: 1, username: 'e2e-user' }] };
  }
  if (pathname === '/users/webhook') return { token: 'webhook-token-e2e' };
  if (pathname === '/users/config') return { notify: {} };

  if (pathname === '/scripts/category') return { categories: [category] };
  if (pathname === '/scripts') return list(script);
  if (pathname === '/scripts/code-search') {
    return list({
      id: 1,
      user_id: 1,
      username: user.username,
      avatar: user.avatar,
      is_admin: 1,
      name: script.name,
      description: script.description,
      snippets: ['console.log("e2e");'],
    });
  }
  if (pathname === `/scripts/${DELETED_SCRIPT_ID}`) {
    return httpError(404, '脚本被删除');
  }
  if (
    pathname === `/scripts/${DELETED_SCRIPT_ID}/reports/${DELETED_REPORT_ID}`
  ) {
    return deletedReport;
  }
  if (
    pathname ===
    `/scripts/${DELETED_SCRIPT_ID}/reports/${DELETED_REPORT_ID}/comments`
  ) {
    return list({
      id: 1,
      user_id: 1,
      avatar: user.avatar,
      username: user.username,
      report_id: DELETED_REPORT_ID,
      content: '我参与过这个举报。',
      type: 1,
      createtime: now - 300,
    });
  }
  // 已删除脚本的其他子资源跟着脚本一起 404，和后端 RequireScript 的行为一致
  if (pathname.startsWith(`/scripts/${DELETED_SCRIPT_ID}/`)) {
    return httpError(404, '脚本被删除');
  }
  if (/^\/scripts\/\d+$/.test(pathname)) return script;
  if (/^\/scripts\/\d+\/code$/.test(pathname)) return script;
  if (/^\/scripts\/\d+\/state$/.test(pathname)) {
    return {
      watch: 0,
      favorite_ids: [],
      watch_count: 0,
      favorite_count: 0,
      issue_count: 1,
      report_count: 1,
    };
  }
  if (/^\/scripts\/\d+\/setting$/.test(pathname)) {
    return {
      data: {
        sync_url: 'https://example.com/e2e.user.js',
        content_url: 'https://example.com/e2e.md',
        definition_url: '',
        sync_mode: 2,
        gray_controls: [],
        enable_pre_release: 2,
      },
    };
  }
  // 版本很多的脚本：版本页的分页（总数、页码）只有在多页时才渲染
  if (pathname === `/scripts/${MANY_VERSIONS_SCRIPT_ID}/versions`) {
    const size = Number(searchParams.get('size')) || 10;
    const page = Number(searchParams.get('page')) || 1;
    return {
      list: Array.from({ length: size }, (_, k) => {
        const n = MANY_VERSIONS_TOTAL - ((page - 1) * size + k);
        return versionItem(n, `1.0.${n}`);
      }),
      total: MANY_VERSIONS_TOTAL,
    };
  }
  if (pathname === `/scripts/${MANY_VERSIONS_SCRIPT_ID}/versions/stat`) {
    return { release_num: MANY_VERSIONS_TOTAL, pre_release_num: 0 };
  }
  if (/^\/scripts\/\d+\/versions$/.test(pathname)) {
    return list(versionItem(1, searchParams.get('version') || '1.0.0'));
  }
  if (/^\/scripts\/\d+\/versions\/stat$/.test(pathname)) {
    return { release_num: 1, pre_release_num: 0 };
  }
  if (/^\/scripts\/\d+\/versions\/[^/]+\/code$/.test(pathname)) {
    return {
      ...script,
      script: {
        ...script.script,
        code: script.script.code,
      },
    };
  }
  if (/^\/scripts\/\d+\/score\/state$/.test(pathname)) {
    return { score_group: { 5: 1 }, score_user_count: 1 };
  }
  if (/^\/scripts\/\d+\/scores$/.test(pathname)) {
    return list({
      id: 1,
      script_id: 1,
      user_id: 1,
      username: user.username,
      avatar: user.avatar,
      score: 5,
      message: 'Good',
      author_message: '',
      author_message_createtime: 0,
      createtime: now - 500,
      updatetime: now,
    });
  }
  if (/^\/script\/\d+\/statistics$/.test(pathname)) {
    const overview = { today: 3, yesterday: 2, week: 12 };
    const chart = {
      x: ['2026-06-18', '2026-06-19', '2026-06-20'],
      y: [1, 2, 3],
    };
    return {
      page_pv: overview,
      page_uv: overview,
      download_uv: overview,
      update_uv: overview,
      uv_chart: {
        download: chart,
        update: chart,
      },
      pv_chart: {
        download: chart,
        update: chart,
      },
    };
  }
  if (/^\/script\/\d+\/statistics\/realtime$/.test(pathname)) {
    return {
      download: { x: ['15:00', '15:01'], y: [1, 2] },
      update: { x: ['15:00', '15:01'], y: [0, 1] },
    };
  }
  if (/^\/scripts\/\d+\/gray-controls$/.test(pathname)) return { controls: [] };
  if (/^\/scripts\/\d+\/issues$/.test(pathname)) return list(issue);
  if (/^\/scripts\/\d+\/issues\/\d+$/.test(pathname)) return issue;
  if (/^\/scripts\/\d+\/issues\/\d+\/comment$/.test(pathname)) {
    return list({
      id: 1,
      user_id: 1,
      avatar: user.avatar,
      username: user.username,
      content: 'E2E issue comment',
      type: 1,
      createtime: now - 400,
    });
  }
  if (/^\/scripts\/\d+\/issues\/\d+\/watch$/.test(pathname))
    return { watch: false };
  if (/^\/scripts\/\d+\/issues\/\d+\/watchs$/.test(pathname)) return list(user);
  if (/^\/scripts\/\d+\/reports$/.test(pathname)) return list(report);
  if (/^\/scripts\/\d+\/reports\/\d+$/.test(pathname)) return report;
  if (/^\/scripts\/\d+\/reports\/\d+\/comments$/.test(pathname)) {
    return list({
      id: 1,
      user_id: 1,
      avatar: user.avatar,
      username: user.username,
      report_id: 1,
      content: 'E2E report comment',
      type: 1,
      createtime: now - 300,
    });
  }
  if (/^\/scripts\/\d+\/access$/.test(pathname)) {
    return list({
      id: 1,
      link_id: 1,
      name: user.username,
      avatar: user.avatar,
      type: 1,
      invite_status: 1,
      role: 'owner',
      is_expire: false,
      expiretime: 0,
      createtime: now - 200,
    });
  }
  if (/^\/scripts\/\d+\/group$/.test(pathname)) {
    return list({
      id: 1,
      name: 'E2E group',
      description: 'Mock group',
      member: [],
    });
  }
  if (/^\/scripts\/\d+\/group\/\d+\/users$/.test(pathname)) {
    return list({
      id: 1,
      user_id: 1,
      username: user.username,
      avatar: user.avatar,
      invite_status: 1,
      expiretime: 0,
    });
  }
  if (/^\/scripts\/\d+\/invite$/.test(pathname)) {
    return list({
      id: 1,
      code: 'invite-e2e',
      used: 0,
      username: user.username,
      is_audit: false,
      invite_status: 1,
      expiretime: now + 3600,
      createtime: now,
    });
  }
  if (/^\/scripts\/invite\/[^/]+$/.test(pathname)) {
    return {
      invite_status: 1,
      script: { username: user.username, name: script.name, id: 1 },
      access: { role: 'guest' },
    };
  }

  if (pathname === '/favorites/folders') {
    return list({
      id: 1,
      user_id: 1,
      name: 'E2E favorites',
      description: 'Favorite fixture',
      private: 2,
      count: 1,
      createtime: now - 2000,
      updatetime: now,
    });
  }
  if (/^\/favorites\/folders\/\d+\/detail$/.test(pathname)) {
    return {
      id: 1,
      user_id: 1,
      name: 'E2E favorites',
      description: 'Favorite fixture',
      private: 2,
      count: 1,
      createtime: now - 2000,
      updatetime: now,
    };
  }
  if (pathname === '/favorites/scripts') return list(script);

  if (pathname === '/announcements/latest') return null;
  if (pathname === '/announcements')
    return list({
      id: 1,
      title: 'E2E announcement',
      content: 'Mock announcement',
      level: 1,
      createtime: now,
    });
  if (pathname === '/advertise') return { ad: null };
  if (pathname === '/notifications') return { list: [], total: 0 };
  if (pathname === '/notifications/unread-count') return { count: 0 };
  if (/^\/notifications\/\d+$/.test(pathname)) {
    return {
      id: 1,
      user_id: 1,
      type: 1,
      title: 'E2E notification',
      content: 'Mock notification',
      read_status: 2,
      createtime: now,
      updatetime: now,
    };
  }
  if (
    pathname === '/audit-logs' ||
    /^\/scripts\/\d+\/audit-logs$/.test(pathname)
  ) {
    return list({
      id: 1,
      action: 'e2e',
      resource: 'script',
      resource_id: 1,
      operator_id: 1,
      operator_name: user.username,
      detail: '{}',
      createtime: now,
    });
  }
  if (pathname === '/chat/sessions')
    return list({
      id: 1,
      title: 'E2E chat',
      createtime: now - 1000,
      updatetime: now,
    });
  if (/^\/chat\/sessions\/\d+\/messages$/.test(pathname)) {
    return list({
      id: 1,
      session_id: 1,
      role: 'assistant',
      content: 'E2E message',
      createtime: now,
    });
  }

  if (pathname === '/auth/oidc/providers') {
    return {
      providers: [
        {
          id: 1,
          name: 'E2E OIDC',
          type: 'oidc',
          icon: '',
          auth_url: 'https://example.com/auth',
        },
      ],
    };
  }
  if (pathname === '/auth/oidc/bind-info') {
    return {
      provider_name: 'E2E OIDC',
      username: 'oidc-user',
      avatar: user.avatar,
    };
  }
  if (
    pathname.startsWith('/login/') ||
    pathname.startsWith('/register/') ||
    pathname.startsWith('/password/')
  ) {
    return {};
  }

  if (pathname.startsWith('/admin/ai-review/full-scan/status')) {
    return {
      running: false,
      total: 0,
      processed: 0,
      last_id: 0,
      start_id: 0,
      end_id: 0,
      limit: 0,
      started_at: 0,
      updated_at: 0,
      recent_errs: [],
    };
  }
  if (pathname.startsWith('/admin/ai-review/stats')) {
    return { since: now - 86_400, counts: {}, total: 0 };
  }
  if (pathname.startsWith('/admin/ai-review/records')) {
    return adminList((i) => ({
      id: 200 + i,
      script_id: adminScriptId(i),
      script_name: pick(ADMIN_SCRIPT_NAMES, i),
      script_code_id: 500 + i,
      user_id: adminUserId(i),
      status: pick([2, 2, 3, 1, 0, 4, 5, 2], i),
      verdict: pick([1, 2, 3, 0, 0, 1, 0, 3], i),
      attempts: pick([1, 1, 2, 1, 0, 3, 1, 1], i),
      model: pick(['gpt-4o-mini', 'deepseek-chat', 'claude-sonnet'], i),
      prompt_tokens: 1200 + i * 731,
      completion_tokens: 80 + i * 37,
      latency_ms: 900 + i * 1311,
      reason: pick(
        [
          '',
          '代码会把 Cookie 发送到第三方域名。',
          '混淆代码中包含远程加载并执行的脚本，且请求地址在运行时拼接，无法静态确认其用途。',
          '',
        ],
        i,
      ),
      summary: {
        zh: pick(['正常', '存在可疑网络请求', '高风险：远程代码执行'], i),
        en: pick(['ok', 'suspicious requests', 'high risk: remote code'], i),
      },
      tags: pick([[], ['network'], ['obfuscated', 'remote-code']], i),
      admin_note: '',
      createtime: now - i * 5400,
      updatetime: now - i * 3600,
    }));
  }
  if (pathname === '/admin/similarity/pairs') {
    return adminList((i) => ({
      id: 300 + i,
      script_a: adminScriptBrief(i, i === 5),
      script_b: adminScriptBrief(i + 3),
      jaccard: pick([0.97, 0.91, 0.84, 0.78, 0.72, 0.66, 0.61, 0.55], i),
      common_count: pick([412, 1280, 96, 33, 2048, 150, 71, 18], i),
      earlier_side: pick(['A', 'B', 'same'] as const, i),
      status: pick([0, 0, 1, 2, 0, 2, 1, 0], i),
      detected_at: now - i * 7200,
      integrity_score: pick([0.92, 0.35, 0.78, 0.12, 0.6, 0.88, 0.45, 0.99], i),
    }));
  }
  if (/^\/admin\/similarity\/pairs\/\d+$/.test(pathname))
    return { detail: pairDetail };
  if (pathname === '/admin/similarity/suspects') {
    return adminList((i) => ({
      script: adminScriptBrief(i, i === 6),
      max_jaccard: pick([0.95, 0.88, 0.81, 0.77, 0.7, 0.64, 0.59, 0.52], i),
      coverage: pick([0.9, 0.62, 0.45, 0.83, 0.3, 0.71, 0.55, 0.4], i),
      top_sources: Array.from({ length: (i % 3) + 1 }, (_, k) => ({
        script_id: adminScriptId(i + k + 1),
        script_name: pick(ADMIN_SCRIPT_NAMES, i + k + 1),
        jaccard: 0.9 - k * 0.1,
        // 与后端一致：0~1 的占比（前端乘 100 显示为百分比）
        contribution_pct: 0.6 - k * 0.2,
      })),
      pair_count: (i % 4) + 1,
      detected_at: now - i * 9000,
      integrity_score: pick([0.9, 0.4, 0.75, 0.2, 0.65, 0.85, 0.5, 0.95], i),
    }));
  }
  if (pathname === '/admin/similarity/integrity/reviews') {
    return adminList((i) => ({
      id: 400 + i,
      script: adminScriptBrief(i, i === 4),
      script_code_id: 600 + i,
      score: pick([0.82, 0.67, 0.91, 0.55, 0.73, 0.6, 0.88, 0.7], i),
      status: pick([0, 0, 1, 2, 0, 1, 2, 0], i),
      createtime: now - i * 4000,
    }));
  }
  if (pathname === '/admin/similarity/whitelist') {
    return adminList((i) => ({
      id: 700 + i,
      script_a: adminScriptBrief(i),
      script_b: adminScriptBrief(i + 2),
      reason: pick(
        [
          '同一作者的分支版本',
          '均基于 MIT 开源库二次开发，已确认授权，不属于抄袭。',
          'fork',
          '官方授权的翻译版本，原作者在仓库 README 中明确允许转载并保留署名。',
        ],
        i,
      ),
      added_by: 1,
      added_by_name: pick(ADMIN_USERNAMES, i % 2),
      createtime: now - i * 86_400,
    }));
  }
  if (pathname === '/admin/similarity/integrity/whitelist') {
    return adminList((i) => ({
      id: 800 + i,
      script: adminScriptBrief(i),
      reason: pick(
        [
          '压缩后的第三方库，人工确认无害',
          '合法的反调试保护',
          '作者提供了未混淆的源码仓库，审核通过。',
          'ok',
        ],
        i,
      ),
      added_by: 1,
      added_by_name: pick(ADMIN_USERNAMES, i % 2),
      createtime: now - i * 86_400,
    }));
  }
  if (pathname.includes('/admin/similarity')) return list({});
  if (pathname === '/similarity/pairs/1') return { detail: pairDetail };

  if (pathname === '/admin/system-configs')
    return { configs: [{ key: 'site.name', value: 'ScriptList E2E' }] };
  if (pathname === '/admin/oauth-apps')
    return adminList((i) => ({
      id: i + 1,
      client_id: `client-e2e-${(0x5f3a1c + i * 7919).toString(16)}`,
      name: pick(
        ['E2E app', 'ScriptCat 同步服务', 'Tampermonkey Cloud Bridge', '论坛'],
        i,
      ),
      description: pick(['Mock OAuth app', '用于脚本云同步', ''], i),
      redirect_uri: pick(
        [
          'https://example.com/callback',
          'https://sync.scriptcat.org/api/v1/oauth/callback?provider=scriptlist&mode=popup',
          'http://localhost:3000/cb',
        ],
        i,
      ),
      status: pick([1, 1, 2], i),
      createtime: now - i * 86_400,
      updatetime: now - i * 3600,
    }));
  if (pathname === '/admin/oidc-providers')
    return adminList((i) => {
      const name = pick(
        [
          'E2E OIDC',
          'GitHub',
          'Google',
          'Microsoft Entra ID',
          'Keycloak（自建）',
        ],
        i,
      );
      const host = pick(
        [
          'example.com',
          'github.com',
          'accounts.google.com',
          'login.microsoftonline.com/9188040d-6c67-4c5b-b112-36a304b66dad/v2.0',
          'sso.internal.example.org/realms/scriptcat',
        ],
        i,
      );
      return {
        id: i + 1,
        name,
        type: pick(['oidc', 'oauth2'], i),
        issuer_url: `https://${host}`,
        auth_url: `https://${host}/auth`,
        token_url: `https://${host}/token`,
        userinfo_url: `https://${host}/userinfo`,
        client_id: `client-${i + 1}-${'x'.repeat(i * 3)}`,
        client_secret: 'secret',
        scopes: 'openid profile email',
        icon: '',
        display_order: i + 1,
        status: pick([1, 1, 2], i),
        createtime: now - i * 86_400,
        updatetime: now - i * 3600,
      };
    });
  if (pathname === '/admin/users')
    return adminList((i) => {
      const banned = i === 2 || i === 5;
      return {
        id: adminUserId(i),
        username: pick(ADMIN_USERNAMES, i),
        email: i === 0 ? user.email : `user${i}@example.com`,
        register_ip: pick(['127.0.0.1', '203.0.113.42', '2001:db8::1f'], i),
        ip_location: pick(['Local', '广东省深圳市', '美国 加利福尼亚州'], i),
        avatar: user.avatar,
        status: banned ? 2 : 1,
        admin_level: pick([1, 0, 0, 2, 0, 3, 0, 0], i),
        createtime: now - i * 86_400 * 30,
        ...(banned
          ? {
              ban_expire_at: i === 5 ? now + 86_400 * 7 : 0,
              ban_reason: pick(['发布恶意脚本', '刷分'], i),
            }
          : {}),
      };
    });
  if (pathname === '/admin/scripts') {
    // 按状态筛选、按趋势分排序，让窄屏工具栏的下拉框能改变结果
    const all = adminList((i) => ({
      id: adminScriptId(i),
      name: pick(ADMIN_SCRIPT_NAMES, i),
      user_id: adminUserId(i),
      username: pick(ADMIN_USERNAMES, i),
      type: pick([1, 1, 2, 1, 3], i),
      public: pick([1, 1, 2, 1, 3], i),
      unwell: pick([2, 2, 2, 1], i),
      // 第 3、6 行是已删除的脚本
      status: i === 2 || i === 5 ? 2 : 1,
      createtime: now - i * 86_400 * 3,
      updatetime: now - i * 3600,
      trending_score: pick([0, 12.5, 3.141593, 0.25, 88, 0, 1.5, 7], i),
      score_multiplier: i === 1 ? 1.5 : 1,
      multiplier_expire_at: i === 1 ? now + 86_400 * 3 : 0,
    }));
    const status = Number(searchParams.get('status'));
    const rows = status
      ? all.list.filter((row) => row.status === status)
      : [...all.list];
    if (searchParams.get('sort_field') === 'trending_score') {
      const dir = searchParams.get('sort_order') === 'asc' ? 1 : -1;
      rows.sort((a, b) => dir * (a.trending_score - b.trending_score));
    }
    return { list: rows, total: status ? rows.length : all.total };
  }
  if (pathname === '/admin/reports')
    return adminList((i) => ({
      id: 100 + i,
      script_id: adminScriptId(i),
      script_name: pick(ADMIN_SCRIPT_NAMES, i),
      user_id: adminUserId(i + 1),
      username: pick(ADMIN_USERNAMES, i + 1),
      reason: pick(['spam', 'malware', 'privacy', 'copyright', 'other'], i),
      comment_count: pick([0, 3, 12, 1], i),
      status: pick([1, 1, 2, 1, 3], i),
      createtime: now - i * 7200,
      updatetime: now - i * 3600,
    }));
  if (pathname === '/admin/content-reports/pending-count') return { count: 3 };
  if (pathname === '/admin/content-reports')
    return adminList((i) => ({
      id: 900 + i,
      target_type: pick(['score', 'issue', 'issue_comment'] as const, i),
      target_id: 50 + i,
      issue_id: i % 3 === 0 ? 0 : 20 + i,
      script_id: adminScriptId(i),
      script_name: i === 4 ? '' : pick(ADMIN_SCRIPT_NAMES, i),
      author_id: adminUserId(i + 2),
      author_name: pick(ADMIN_USERNAMES, i + 2),
      summary: pick(
        [
          '垃圾广告，加我 QQ 领取免费会员',
          '【无法使用】更新到 2.3 之后在 Edge 浏览器里点击按钮没有任何反应，控制台报错 Cannot read properties of undefined',
          '作者是骗子',
          '这个脚本会偷 Cookie，大家别用！！！',
        ],
        i,
      ),
      target_deleted: i === 3,
      reason: pick(
        ['spam', 'abuse', 'porn', 'illegal', 'misleading', 'other'] as const,
        i,
      ),
      content: pick(['', '多次发布同样的广告', '人身攻击'], i),
      user_id: adminUserId(i + 1),
      username: pick(ADMIN_USERNAMES, i + 1),
      pending_count: pick([1, 3, 0, 2], i),
      status: pick([1, 1, 2, 3, 1, 2, 1, 1] as const, i),
      handle_result: pick(['', '', 'deleted', 'rejected', '', 'resolved'], i),
      createtime: now - i * 5000,
    }));
  if (pathname === '/admin/feedbacks')
    return adminList((i) => ({
      id: 1000 + i,
      reason: pick(['bug', 'feature', 'better', 'unused', 'other'], i),
      content: pick(
        [
          'Mock feedback',
          '',
          '同步功能经常失败，换了三台电脑都一样，希望能提供手动导出备份的入口，或者至少在失败时给出明确的错误原因，而不是静默不动。',
          '找到了更轻量的扩展',
          'ok',
        ],
        i,
      ),
      client_ip: pick(['127.0.0.1', '198.51.100.23', '2001:db8::7'], i),
      ip_location: pick(['Local', '浙江省杭州市', '日本 东京都'], i),
      createtime: now - i * 3000,
    }));
  if (pathname === '/admin/scores')
    return adminList((i) => ({
      id: 1100 + i,
      user_id: adminUserId(i + 1),
      username: pick(ADMIN_USERNAMES, i + 1),
      script_id: adminScriptId(i),
      script_name: pick(ADMIN_SCRIPT_NAMES, i),
      score: pick([5, 1, 4, 3, 2, 5, 1, 4], i),
      message: pick(
        [
          'Good',
          '完全不能用，装上之后整个页面白屏，作者也不回复反馈。建议大家先看看反馈区再决定要不要装，浪费了我一个小时排查到底是哪个扩展冲突。',
          '好用，感谢作者',
          '',
        ],
        i,
      ),
      createtime: now - i * 4000,
    }));
  if (pathname === '/admin/script-audits')
    return adminList((i) => ({
      id: 1200 + i,
      script_id: adminScriptId(i),
      code_id: 1300 + i,
      submitter_id: adminUserId(i),
      submitter: pick(ADMIN_USERNAMES, i),
      script_name: pick(ADMIN_SCRIPT_NAMES, i),
      version: pick(['1.0.0', '2.13.4-beta.2', '0.1', '2026.11.17'], i),
      status: pick([1, 1, 2, 3, 1, 2, 3, 1], i),
      script_status: pick([3, 3, 1, 1, 3, 1, 1, 3], i),
      reason: pick(['', '', '', '包含混淆代码，且未说明用途'], i),
      createtime: now - i * 6000,
    }));
  if (pathname === '/advertise/admin')
    return adminList((i) => ({
      id: i + 1,
      // 多值：管理端列表要渲染 Tag 列表 + 「N 个位」摘要，单值走不到那条分支。
      slot_keys: pick(
        ['home-banner,search-sidebar', 'search-sidebar', 'script-detail-top'],
        i,
      ),
      ad_type: pick(['image', 'image', 'adsense'] as const, i),
      ad_unit_id: i % 3 === 2 ? `12345678${i}` : '',
      title: pick(
        [
          'E2E ad',
          '双十一云服务器特惠：新用户首年仅需 99 元，老用户续费同享八折优惠',
          'VPS',
          'ScriptCat Pro',
        ],
        i,
      ),
      languages: pick(['zh-CN,en', '', 'zh-CN', 'en,ja,de,ru'], i),
      image_url_light: '',
      image_url_dark: '',
      link_url: 'https://example.com',
      weight: pick([1, 10, 5, 100], i),
      enabled: i % 4 !== 3,
      start_at: now - 10 - i * 86_400,
      end_at: pick([now + 10_000, 0, now - 3600, now + 86_400 * 30], i),
      impressions: pick([0, 15_230, 987_654, 42], i),
      clicks: pick([0, 312, 10_245, 1], i),
      createtime: now - i * 86_400,
      updatetime: now - i * 3600,
    }));
  if (/^\/advertise\/admin\/\d+\/click-stats$/.test(pathname))
    return { daily: [], total_clicks: 0, empty_referer_clicks: 0, days: 30 };
  if (/^\/advertise\/admin\/\d+\/clicks$/.test(pathname)) return list({});
  if (pathname === '/admin/announcements')
    return adminList((i) => ({
      id: i + 1,
      title: JSON.stringify(
        pick(
          [
            { 'zh-CN': 'E2E公告' },
            {
              'zh-CN':
                '服务器将于本周六凌晨 2:00-4:00 进行数据库迁移维护，期间脚本同步与发布暂停',
              'en-US': 'Scheduled maintenance this Saturday 02:00-04:00',
            },
            {
              'zh-CN': '新功能：脚本相似度检测上线',
              'en-US': 'New: similarity',
            },
          ],
          i,
        ),
      ),
      content: JSON.stringify({ 'zh-CN': 'Mock announcement' }),
      level: pick([1, 2, 1], i),
      status: pick([1, 1, 2, 1], i),
      createtime: now - i * 86_400,
      updatetime: now - i * 3600,
    }));

  return {};
}

function handler(req: IncomingMessage, res: ServerResponse) {
  if (!req.url) return send(res, 400, ok({}));
  if (req.method === 'OPTIONS') return send(res, 204, {});

  const url = new URL(req.url, `http://${req.headers.host || '127.0.0.1'}`);
  const payload = route(url.pathname, req.method || 'GET', url.searchParams);
  if (isHttpError(payload)) {
    const { status, msg } = payload[HTTP_ERROR];
    return send(res, status, { code: -1, msg, data: null });
  }
  if (url.pathname === '/healthz') return send(res, 200, payload);
  return send(res, 200, ok(payload));
}

const server = createServer(handler);

server.listen(port, '127.0.0.1', () => {
  process.stdout.write(`E2E mock API listening on http://127.0.0.1:${port}\n`);
});
