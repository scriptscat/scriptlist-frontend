import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

const MONACO_ASSET_PREFIX = '/assets/monaco-editor/0.56.0/min/vs/';

type MonacoRuntime = {
  editor: {
    createModel(
      value: string,
      language: string,
    ): {
      dispose(): void;
      uri: { toString(): string };
    };
    getModels(): Array<{ uri: { toString(): string } }>;
  };
  languages: {
    json: {
      getWorker(): Promise<
        (uri: unknown) => Promise<{
          doValidation(uri: string): Promise<unknown>;
        }>
      >;
    };
    typescript: {
      getJavaScriptWorker(): Promise<
        (uri: unknown) => Promise<{
          getSemanticDiagnostics(uri: string): Promise<unknown>;
        }>
      >;
    };
  };
};

function watchMonacoRuntime(page: Page) {
  const issues: string[] = [];
  const successfulAssets = new Set<string>();

  page.on('pageerror', (error) => {
    issues.push(`pageerror: ${error.message}`);
  });
  page.on('console', (message) => {
    if (
      message.type() === 'error' &&
      /monaco|worker|unexpected usage|could not create web worker/i.test(
        message.text(),
      )
    ) {
      issues.push(`console: ${message.text()}`);
    }
  });
  page.on('requestfailed', (request) => {
    const url = new URL(request.url());
    if (url.pathname.startsWith(MONACO_ASSET_PREFIX)) {
      issues.push(
        `requestfailed: ${url.pathname}: ${request.failure()?.errorText}`,
      );
    }
  });
  page.on('response', (response) => {
    const url = new URL(response.url());
    if (!url.pathname.startsWith(MONACO_ASSET_PREFIX)) return;
    if (response.ok()) successfulAssets.add(url.pathname);
    else issues.push(`response: ${response.status()} ${url.pathname}`);
  });

  return { issues, successfulAssets };
}

async function expectSuccessfulAsset(
  successfulAssets: Set<string>,
  pattern: RegExp,
) {
  await expect
    .poll(() => [...successfulAssets].some((asset) => pattern.test(asset)))
    .toBe(true);
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

test('loads the code editor and its JavaScript and JSON workers from same-origin assets', async ({
  page,
}, testInfo) => {
  const runtime = watchMonacoRuntime(page);

  await page.goto('/zh-CN/script-show-page/1/code', { waitUntil: 'commit' });

  const editor = page.locator('.monaco-editor').first();
  await expect(editor).toBeVisible();
  await expect(editor.locator('.view-lines')).toContainText(
    'console.log("e2e");',
  );
  await expect(editor.locator('textarea.inputarea:visible')).toHaveCount(0);

  await page.evaluate(async () => {
    const monaco = (
      globalThis as typeof globalThis & { monaco?: MonacoRuntime }
    ).monaco;
    if (!monaco) throw new Error('Monaco global did not load');

    const javascriptModel = monaco.editor.getModels()[0];
    if (!javascriptModel) throw new Error('JavaScript model did not load');
    const getJavaScriptWorker =
      await monaco.languages.typescript.getJavaScriptWorker();
    const javascriptWorker = await getJavaScriptWorker(javascriptModel.uri);
    await javascriptWorker.getSemanticDiagnostics(
      javascriptModel.uri.toString(),
    );

    const jsonModel = monaco.editor.createModel('{"ready":true}', 'json');
    try {
      const getJsonWorker = await monaco.languages.json.getWorker();
      const jsonWorker = await getJsonWorker(jsonModel.uri);
      await jsonWorker.doValidation(jsonModel.uri.toString());
    } finally {
      jsonModel.dispose();
    }
  });

  await expectSuccessfulAsset(runtime.successfulAssets, /\/loader\.js$/);
  await expectSuccessfulAsset(
    runtime.successfulAssets,
    /\/editor\/editor\.main\.js$/,
  );
  await expectSuccessfulAsset(
    runtime.successfulAssets,
    /\/editor\/editor\.main\.css$/,
  );
  await expectSuccessfulAsset(
    runtime.successfulAssets,
    /\/assets\/editor\.worker-[^/]+\.js$/,
  );
  await expectSuccessfulAsset(
    runtime.successfulAssets,
    /\/assets\/ts\.worker-[^/]+\.js$/,
  );
  await expectSuccessfulAsset(
    runtime.successfulAssets,
    /\/assets\/json\.worker-[^/]+\.js$/,
  );
  expect(runtime.issues).toEqual([]);

  const screenshotPath = testInfo.outputPath('monaco-code-page.png');
  await page.screenshot({ path: screenshotPath, fullPage: true });
  await testInfo.attach('monaco-code-page', {
    path: screenshotPath,
    contentType: 'image/png',
  });
});

test('loads the side-by-side diff editor from the same Monaco asset root', async ({
  page,
}) => {
  const runtime = watchMonacoRuntime(page);

  await page.goto(
    '/zh-CN/script-show-page/1/diff?version1=1.0.0&version2=1.0.1',
    { waitUntil: 'commit' },
  );

  await expect(page.locator('.monaco-diff-editor')).toBeVisible();
  const visibleEditors = page.locator(
    '.monaco-diff-editor .view-lines:visible',
  );
  await expect(visibleEditors).toHaveCount(2);
  await expect(visibleEditors.first()).toContainText('console.log("e2e");');
  await expect(visibleEditors.last()).toContainText('console.log("e2e");');
  await expectSuccessfulAsset(runtime.successfulAssets, /\/loader\.js$/);
  await expectSuccessfulAsset(
    runtime.successfulAssets,
    /\/editor\/editor\.main\.js$/,
  );
  expect(runtime.issues).toEqual([]);
});
