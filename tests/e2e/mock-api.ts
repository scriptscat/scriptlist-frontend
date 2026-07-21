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
  content:
    '## E2E Userscript\n\nThis content is served by the Playwright mock API.',
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
const ok = (data: unknown) => ({ code: 0, msg: 'ok', data });

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
  if (/^\/scripts\/\d+\/versions$/.test(pathname)) {
    return list({
      id: 1,
      user_id: 1,
      username: user.username,
      avatar: user.avatar,
      meta_json: script.script.meta_json,
      script_id: 1,
      version: searchParams.get('version') || '1.0.0',
      changelog: 'Initial e2e fixture',
      is_pre_release: 2,
      status: 1,
      createtime: now - 1000,
      code: script.script.code,
      definition: '',
    });
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
    return list({
      id: 1,
      script_id: 1,
      script_name: script.name,
      script_code_id: 1,
      user_id: 1,
      status: 2,
      verdict: 1,
      attempts: 1,
      model: 'e2e',
      prompt_tokens: 1,
      completion_tokens: 1,
      latency_ms: 1,
      reason: '',
      summary: 'ok',
      tags: [],
      createtime: now,
      updatetime: now,
    });
  }
  if (pathname === '/admin/similarity/pairs') {
    return list({
      id: 1,
      script_a: pairDetail.script_a,
      script_b: pairDetail.script_b,
      jaccard: 0.9,
      common_count: 12,
      earlier_side: 'A',
      status: 1,
      detected_at: now,
      integrity_score: 90,
    });
  }
  if (/^\/admin\/similarity\/pairs\/\d+$/.test(pathname))
    return { detail: pairDetail };
  if (pathname === '/admin/similarity/suspects') {
    return list({
      script: pairDetail.script_a,
      max_jaccard: 0.9,
      coverage: 0.8,
      top_sources: [],
      pair_count: 1,
      detected_at: now,
      integrity_score: 90,
    });
  }
  if (pathname.includes('/admin/similarity')) return list({});
  if (pathname === '/similarity/pairs/1') return { detail: pairDetail };

  if (pathname === '/admin/system-configs')
    return { configs: [{ key: 'site.name', value: 'ScriptList E2E' }] };
  if (pathname === '/admin/oauth-apps')
    return list({
      id: 1,
      client_id: 'client-e2e',
      name: 'E2E app',
      description: 'Mock OAuth app',
      redirect_uri: 'https://example.com/callback',
      status: 1,
      createtime: now,
      updatetime: now,
    });
  if (pathname === '/admin/oidc-providers')
    return list({
      id: 1,
      name: 'E2E OIDC',
      type: 'oidc',
      issuer_url: 'https://example.com',
      auth_url: 'https://example.com/auth',
      token_url: 'https://example.com/token',
      userinfo_url: 'https://example.com/user',
      client_id: 'client',
      client_secret: 'secret',
      scopes: 'openid profile',
      icon: '',
      display_order: 1,
      status: 1,
      createtime: now,
      updatetime: now,
    });
  if (pathname === '/admin/users')
    return list({
      id: 1,
      username: user.username,
      email: user.email,
      register_ip: '127.0.0.1',
      ip_location: 'Local',
      avatar: user.avatar,
      status: 1,
      admin_level: 1,
      createtime: now,
    });
  if (pathname === '/admin/scripts')
    return list({
      id: 1,
      name: script.name,
      user_id: 1,
      username: user.username,
      type: 1,
      public: 1,
      unwell: 2,
      status: 1,
      createtime: now,
      updatetime: now,
      trending_score: 0,
      score_multiplier: 1,
      multiplier_expire_at: 0,
    });
  if (pathname === '/admin/reports')
    return list({
      id: 1,
      script_id: 1,
      script_name: script.name,
      user_id: 1,
      username: user.username,
      reason: 'spam',
      comment_count: 0,
      status: 1,
      createtime: now,
      updatetime: now,
    });
  if (pathname === '/admin/feedbacks')
    return list({
      id: 1,
      reason: 'E2E',
      content: 'Mock feedback',
      client_ip: '127.0.0.1',
      createtime: now,
    });
  if (pathname === '/admin/scores')
    return list({
      id: 1,
      user_id: 1,
      username: user.username,
      script_id: 1,
      script_name: script.name,
      score: 5,
      message: 'Good',
      createtime: now,
    });
  if (pathname === '/admin/script-audits')
    return list({
      id: 1,
      script_id: 1,
      code_id: 1,
      submitter_id: 1,
      submitter: user.username,
      script_name: script.name,
      version: '1.0.0',
      status: 1,
      reason: '',
      createtime: now,
    });
  if (pathname === '/advertise/admin')
    return list({
      id: 1,
      slot_key: 'home_sidebar',
      title: 'E2E ad',
      languages: 'zh-CN,en',
      image_url_light: '',
      image_url_dark: '',
      link_url: 'https://example.com',
      weight: 1,
      enabled: true,
      start_at: now - 10,
      end_at: now + 10_000,
      impressions: 0,
      clicks: 0,
      createtime: now,
      updatetime: now,
    });
  if (/^\/advertise\/admin\/\d+\/click-stats$/.test(pathname))
    return { daily: [], total_clicks: 0, empty_referer_clicks: 0, days: 30 };
  if (/^\/advertise\/admin\/\d+\/clicks$/.test(pathname)) return list({});
  if (pathname === '/admin/announcements')
    return list({
      id: 1,
      title: '{"zh-CN":"E2E公告"}',
      content: '{"zh-CN":"Mock announcement"}',
      level: 1,
      status: 1,
      createtime: now,
      updatetime: now,
    });

  return {};
}

function handler(req: IncomingMessage, res: ServerResponse) {
  if (!req.url) return send(res, 400, ok({}));
  if (req.method === 'OPTIONS') return send(res, 204, {});

  const url = new URL(req.url, `http://${req.headers.host || '127.0.0.1'}`);
  const payload = route(url.pathname, req.method || 'GET', url.searchParams);
  if (url.pathname === '/healthz') return send(res, 200, payload);
  return send(res, 200, ok(payload));
}

const server = createServer(handler);

server.listen(port, '127.0.0.1', () => {
  process.stdout.write(`E2E mock API listening on http://127.0.0.1:${port}\n`);
});
