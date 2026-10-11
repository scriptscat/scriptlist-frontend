import type { ScriptVersion } from '@/lib/api/services/scripts/scripts';
import { EnablePreRelease } from '@/lib/api/services/scripts/scripts';

/** 对应后端的 consts.ACTIVE；版本是软删除，删掉后 status 变成非 1。 */
export const VERSION_STATUS_ACTIVE = 1;

type VersionFlags = Pick<ScriptVersion, 'status' | 'is_pre_release'>;

export function isVersionDeleted(version: Pick<ScriptVersion, 'status'>) {
  return version.status !== VERSION_STATUS_ACTIVE;
}

/**
 * 「最新版本」指的是列表里第一条**未删除**的正式版——和后端 FindLatest 的口径
 * 一致（它只看 status=ACTIVE）。管理员能看到已删除版本，若仍按下标 0 判断，
 * 一条被删掉的最新版会同时挂上「已删除」和「最新版本」两个自相矛盾的徽标。
 *
 * 列表按时间倒序分页，所以只有第一页可能包含最新版本。
 */
export function findLatestReleaseIndex(
  versions: VersionFlags[],
  currentPage: number,
): number {
  if (currentPage !== 1) {
    return -1;
  }
  return versions.findIndex(
    (version) =>
      !isVersionDeleted(version) &&
      version.is_pre_release === EnablePreRelease.DisablePreReleaseScript,
  );
}

/**
 * 管理员视角的版本总数把已删除版本也算进去了，而 release/pre-release 两个计数
 * 来自 VersionStat（只统计未删除的），不显式标出差额的话，头部的三个数字对不上。
 */
export function deletedVersionCount(
  totalVersions: number,
  releaseCount: number,
  preReleaseCount: number,
): number {
  return Math.max(0, totalVersions - releaseCount - preReleaseCount);
}
