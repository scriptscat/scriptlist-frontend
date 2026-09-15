import { describe, expect, it } from 'vitest';
import { EnablePreRelease } from '@/lib/api/services/scripts/scripts';
import {
  deletedVersionCount,
  findLatestReleaseIndex,
  isVersionDeleted,
} from './versionBadges';

const release = (status: number) => ({
  status,
  is_pre_release: EnablePreRelease.DisablePreReleaseScript,
});
const preRelease = (status: number) => ({
  status,
  is_pre_release: EnablePreRelease.EnablePreReleaseScript,
});

describe('isVersionDeleted', () => {
  it('status 为 1 以外的值都算已删除', () => {
    expect(isVersionDeleted({ status: 1 })).toBe(false);
    expect(isVersionDeleted({ status: 2 })).toBe(true);
  });
});

describe('findLatestReleaseIndex', () => {
  it('最新版本指向第一条未删除的正式版', () => {
    expect(findLatestReleaseIndex([release(1), release(1)], 1)).toBe(0);
  });

  it('最新的正式版被删掉时，徽标落到下一条存活的正式版上', () => {
    expect(findLatestReleaseIndex([release(2), release(1)], 1)).toBe(1);
  });

  it('预发布版不是最新版本', () => {
    expect(findLatestReleaseIndex([preRelease(1), release(1)], 1)).toBe(1);
  });

  it('全部已删除时没有最新版本', () => {
    expect(findLatestReleaseIndex([release(2), release(2)], 1)).toBe(-1);
  });

  it('第二页起不标最新版本', () => {
    expect(findLatestReleaseIndex([release(1)], 2)).toBe(-1);
  });
});

describe('deletedVersionCount', () => {
  it('总数减去正式版与预发布版就是已删除数', () => {
    expect(deletedVersionCount(10, 6, 2)).toBe(2);
  });

  it('普通用户看不到已删除版本，三个数字本来就对得上', () => {
    expect(deletedVersionCount(8, 6, 2)).toBe(0);
  });

  it('统计接口失败导致计数为 0 时不显示负数', () => {
    expect(deletedVersionCount(3, 0, 0)).toBe(3);
    expect(deletedVersionCount(0, 6, 2)).toBe(0);
  });
});
