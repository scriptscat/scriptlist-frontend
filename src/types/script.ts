import type { MetaJson } from '@/app/[locale]/script-show-page/[id]/types';

export interface ScriptItem {
  id: number;
  title: string;
  meta_json?: MetaJson;
}

export type RecentItem = ScriptItem;
export type RatingItem = ScriptItem;
