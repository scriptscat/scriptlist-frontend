/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import ScriptDetailTabs from './ScriptDetailTabs';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => 'zh-CN',
}));

beforeAll(() => {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      disconnect() {}
      unobserve() {}
    },
  );
});

const script = {
  id: 7,
  name: 'demo',
  summary: {},
  script: { meta_json: { name: ['demo'] } },
};

vi.mock('./ScriptContext', () => ({
  useScript: () => ({ script }),
}));

vi.mock('@/components/MarkdownView', () => ({
  default: () => <div data-testid="description-content" />,
}));

vi.mock('./ScriptMetadataExplainer', () => ({
  default: () => <div data-testid="metadata-content" />,
}));

vi.mock('../version/components/ScriptVersionsClient', () => ({
  default: () => <div data-testid="versions-content" />,
}));

vi.mock('../comment/components/ScriptRatingClient', () => ({
  default: () => <div data-testid="ratings-content" />,
}));

// Keep the test focused on the tab's mount boundary; the production file still
// uses next/dynamic to load these two panels.
vi.mock('next/dynamic', () => ({
  default: () => {
    return function MockDynamicPanel(props: { id?: string }) {
      return props.id === 'readme' ? (
        <div data-testid="description-content" />
      ) : (
        <div data-testid="dynamic-panel" />
      );
    };
  },
}));

const commonProps = {
  content: 'readme',
  initialVersionData: null,
  versionStat: null,
  versionError: undefined,
  initialScoreList: null,
  initialRatingStats: {
    averageRating: 0,
    totalRatings: 12,
    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  },
};

describe('ScriptDetailTabs lazy panels', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(cleanup);

  it('does not mount version or rating panels while description is active', () => {
    render(<ScriptDetailTabs {...commonProps} />);

    expect(screen.getByTestId('description-content')).toBeInTheDocument();
    expect(screen.queryByTestId('dynamic-panel')).not.toBeInTheDocument();
  });

  it('mounts the selected panel only after its tab is activated', () => {
    render(<ScriptDetailTabs {...commonProps} />);

    fireEvent.click(screen.getByText('tabs.versions'));
    expect(screen.getByTestId('dynamic-panel')).toBeInTheDocument();
  });
});
