import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

// Regression test for scriptscat/scriptcat.org#53:
// Accepting a script invite used to leave the invitee on the invite result page —
// a dead end that echoes back the now-spent invite code and, on refresh, reads as
// a failure. A permission that took effect immediately must land the user
// somewhere they can use it: the management page for `manager`, the script detail
// page otherwise. An invite still awaiting admin audit granted nothing yet, so it
// must NOT redirect.

const CODE = 'e2e-invite-redirect';
const INVITE_URL = `/zh-CN/scripts/invite?code=${CODE}`;

// The redirect targets are server-rendered, so the URL only commits once `next dev`
// has compiled the target route and returned its payload. That is slow enough here to
// be its own failure mode: page-smoke's own `renders /script-show-page/1/manage` fails
// with net::ERR_ABORTED after 90s on an untouched tree, while every /manage/* sibling
// passes. So the manager case asserts the router *targeted* /manage (a request goes
// out for it) rather than waiting for that route to render — what is under test is the
// redirect decision, not the dev server's compile speed. The guest case still asserts a
// fully committed URL, which keeps one end-to-end navigation in the suite.
const REDIRECT_TIMEOUT = 60_000;

// invite_status: 1 未使用, 2 已接受, 3 过期, 4 等待审核, 5 已拒绝
const STATUS_ACCEPTED = 2;
const STATUS_PENDING_AUDIT = 4;

/**
 * Stubs the two invite endpoints the page talks to. The GET flips to
 * `statusAfterAccept` only once the accept PUT has landed, which is what the
 * component's own mutate() re-reads.
 */
async function stubInvite(
  page: Page,
  fixture: { role?: string; statusAfterAccept: number },
) {
  let accepted = false;

  await page.route(`**/api/v2/scripts/invite/${CODE}/accept`, async (route) => {
    accepted = true;
    await route.fulfill({ json: { code: 0, msg: 'ok', data: {} } });
  });

  await page.route(`**/api/v2/scripts/invite/${CODE}`, async (route) => {
    await route.fulfill({
      json: {
        code: 0,
        msg: 'ok',
        data: {
          invite_status: accepted ? fixture.statusAfterAccept : 1,
          script: { username: 'e2e-user', name: 'E2E Userscript', id: 1 },
          ...(fixture.role ? { access: { role: fixture.role } } : {}),
        },
      },
    });
  });
}

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

test.describe('accepting a script invite lands somewhere actionable', () => {
  test('manager invite redirects to the script management page', async ({
    page,
  }) => {
    await stubInvite(page, {
      role: 'manager',
      statusAfterAccept: STATUS_ACCEPTED,
    });
    await page.goto(INVITE_URL);

    // Arm before clicking so the request cannot be missed in the gap.
    const managementRequest = page.waitForRequest(
      (request) =>
        new URL(request.url()).pathname === '/zh-CN/script-show-page/1/manage',
      { timeout: REDIRECT_TIMEOUT },
    );

    await page.getByRole('button', { name: '同意' }).click();

    // Fails if the redirect never fires, or fires at the detail page instead: the
    // pathname match is exact, so /script-show-page/1 does not satisfy it.
    await managementRequest;
  });

  test('guest invite redirects to the script detail page', async ({ page }) => {
    await stubInvite(page, {
      role: 'guest',
      statusAfterAccept: STATUS_ACCEPTED,
    });
    await page.goto(INVITE_URL);

    await page.getByRole('button', { name: '同意' }).click();

    // Detail page, not /manage — a guest has no business on the management page.
    await expect(page).toHaveURL(/\/zh-CN\/script-show-page\/1$/, {
      timeout: REDIRECT_TIMEOUT,
    });
  });

  // Rejecting a *link* invite also lands the invite row on status 2: the backend sets
  // the access row to Reject and then marks the invite Used (access_invite.go, the
  // InviteCodeTypeLink branch). So status 2 alone does not mean "accepted", and the
  // redirect must additionally be gated on the user having pressed 同意 — without that
  // guard, declining an invite would walk the user into the script.
  test('rejecting an invite does not redirect', async ({ page }) => {
    await stubInvite(page, {
      role: 'manager',
      statusAfterAccept: STATUS_ACCEPTED,
    });
    await page.goto(INVITE_URL);

    await page.getByRole('button', { name: '拒绝' }).click();

    await expect(page.locator('body')).toContainText('提交成功');
    await page.waitForTimeout(3_000);
    await expect(page).toHaveURL(new RegExp(`/scripts/invite\\?code=${CODE}$`));
  });

  test('invite awaiting admin audit stays on the invite page', async ({
    page,
  }) => {
    await stubInvite(page, {
      role: 'manager',
      statusAfterAccept: STATUS_PENDING_AUDIT,
    });
    await page.goto(INVITE_URL);

    await page.getByRole('button', { name: '同意' }).click();

    // The waiting state proves the accept round-tripped and mutate() re-read it.
    await expect(page.locator('body')).toContainText('等待处理');

    // Asserting the URL the instant the waiting state appears would also pass against
    // a redirect that fires a moment later, so hold long enough for one to happen and
    // then require that none did. There is no event to await for "did not navigate".
    await page.waitForTimeout(3_000);
    await expect(page).toHaveURL(new RegExp(`/scripts/invite\\?code=${CODE}$`));
  });
});
