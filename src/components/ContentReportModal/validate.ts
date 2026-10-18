import type { ContentReportReason } from '@/types/api';

export const NOTE_MAX_LENGTH = 500;

export const CONTENT_REPORT_REASONS: ContentReportReason[] = [
  'spam',
  'abuse',
  'porn',
  'illegal',
  'misleading',
  'other',
];

export type ContentReportValidationError = 'note_required' | 'note_too_long';

export interface ContentReportValidation {
  canSubmit: boolean;
  error?: ContentReportValidationError;
}

/** 按字符（与后端 rune 一致）计数，而不是 UTF-16 单元 */
export function countChars(text: string): number {
  return Array.from(text).length;
}

export function validateContentReport(input: {
  reason: ContentReportReason | undefined;
  note: string;
}): ContentReportValidation {
  if (!input.reason) {
    return { canSubmit: false };
  }
  const note = input.note.trim();
  if (input.reason === 'other' && note === '') {
    return { canSubmit: false, error: 'note_required' };
  }
  if (countChars(note) > NOTE_MAX_LENGTH) {
    return { canSubmit: false, error: 'note_too_long' };
  }
  return { canSubmit: true };
}
