/** @vitest-environment jsdom */
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ScriptIcon from './ScriptIcon';
import { ScriptUtils } from '@/app/[locale]/(main)/script-show-page/[id]/utils';

const script = {
  id: 42,
  updatetime: 1700000000,
  script: {
    meta_json: {
      name: ['demo'],
      description: [''],
      icon: ['https://example.com/icon.png'],
    },
  },
};

describe('Script icon thumbnail URLs', () => {
  it('maps rendered sizes to the fixed 64/128 thumbnail presets', () => {
    expect(ScriptUtils.icon(script, 24)).toBe(
      '/api/v2/scripts/42/icon/thumb/64?t=1700000000',
    );
    expect(ScriptUtils.icon(script, 64)).toBe(
      '/api/v2/scripts/42/icon/thumb/64?t=1700000000',
    );
    expect(ScriptUtils.icon(script, 96)).toBe(
      '/api/v2/scripts/42/icon/thumb/128?t=1700000000',
    );
    expect(ScriptUtils.icon(script, 128)).toBe(
      '/api/v2/scripts/42/icon/thumb/128?t=1700000000',
    );
  });

  it('tries the original proxy after a thumbnail 404, then uses the existing fallback', () => {
    render(<ScriptIcon script={script} name="Demo" size={64} />);

    const image = screen.getByRole('img');
    expect(image).toHaveAttribute(
      'src',
      '/api/v2/scripts/42/icon/thumb/64?t=1700000000',
    );

    fireEvent.error(image);
    expect(screen.getByRole('img')).toHaveAttribute(
      'src',
      '/api/v2/scripts/42/icon?t=1700000000',
    );

    fireEvent.error(screen.getByRole('img'));
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.getByText('D')).toBeInTheDocument();
  });
});
