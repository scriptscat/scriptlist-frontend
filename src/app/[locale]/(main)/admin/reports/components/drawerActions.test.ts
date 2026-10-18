import { describe, expect, it } from 'vitest';
import {
  CONTENT_REPORT_NOTE_MAX,
  buildHandleBody,
  drawerActionsFor,
} from './drawerActions';

describe('drawerActionsFor', () => {
  it('待处理：驳回 / 标记已处理 / 删除内容并结案', () => {
    expect(drawerActionsFor(1)).toEqual(['reject', 'resolve', 'delete']);
  });
  it('已处理 / 已驳回：只有重新打开', () => {
    expect(drawerActionsFor(2)).toEqual(['reopen']);
    expect(drawerActionsFor(3)).toEqual(['reopen']);
  });
});

describe('buildHandleBody', () => {
  it('带上动作与去除首尾空白的备注', () => {
    expect(buildHandleBody('delete', '  违规广告 ')).toEqual({
      action: 'delete',
      note: '违规广告',
    });
  });
  it('备注为空白时不发送 note', () => {
    expect(buildHandleBody('reject', '   ')).toEqual({ action: 'reject' });
  });
  it('备注上限 500', () => {
    expect(CONTENT_REPORT_NOTE_MAX).toBe(500);
  });
});
