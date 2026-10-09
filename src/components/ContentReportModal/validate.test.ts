import { describe, expect, it } from 'vitest';
import { NOTE_MAX_LENGTH, validateContentReport } from './validate';

describe('validateContentReport', () => {
  it('未选原因不可提交', () => {
    expect(validateContentReport({ reason: undefined, note: '' })).toEqual({
      canSubmit: false,
    });
  });

  it('选了普通原因且无说明可以提交', () => {
    expect(validateContentReport({ reason: 'spam', note: '' })).toEqual({
      canSubmit: true,
    });
  });

  it('其他 + 空白说明：不可提交并提示必填', () => {
    expect(validateContentReport({ reason: 'other', note: '   \n ' })).toEqual({
      canSubmit: false,
      error: 'note_required',
    });
  });

  it('其他 + 有说明可以提交', () => {
    expect(validateContentReport({ reason: 'other', note: ' 广告 ' })).toEqual({
      canSubmit: true,
    });
  });

  it('说明恰好 500 字可提交，501 字报错', () => {
    expect(
      validateContentReport({
        reason: 'spam',
        note: 'a'.repeat(NOTE_MAX_LENGTH),
      }).canSubmit,
    ).toBe(true);
    expect(
      validateContentReport({
        reason: 'spam',
        note: 'a'.repeat(NOTE_MAX_LENGTH + 1),
      }),
    ).toEqual({ canSubmit: false, error: 'note_too_long' });
  });

  it('按字符（rune）而非 UTF-16 单元计数，trim 后计数', () => {
    // 500 个 emoji = 1000 个 UTF-16 单元，但只有 500 个字符
    expect(
      validateContentReport({ reason: 'spam', note: ' ' + '😀'.repeat(500) })
        .canSubmit,
    ).toBe(true);
  });
});
