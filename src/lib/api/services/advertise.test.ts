import { afterEach, describe, expect, it, vi } from 'vitest';
import { advertiseService } from './advertise';
import { apiClient } from '../client';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('advertiseService.adminList', () => {
  it('把类型筛选下推给后端，避免只筛当前一页', async () => {
    const get = vi
      .spyOn(apiClient, 'get')
      .mockResolvedValue({ list: [], total: 0 } as never);

    await advertiseService.adminList(2, 20, 'home-banner', true, 'adsense');

    expect(get).toHaveBeenCalledWith('/advertise/admin', {
      page: 2,
      size: 20,
      slot: 'home-banner',
      enabled: true,
      ad_type: 'adsense',
    });
  });
});

describe('advertiseService.adminCountByType', () => {
  it('用后端返回的 total 计数，而不是扫一页（后端 size 上限 100）', async () => {
    const get = vi
      .spyOn(apiClient, 'get')
      .mockResolvedValue({ list: [], total: 137 } as never);

    await expect(advertiseService.adminCountByType('adsense')).resolves.toBe(
      137,
    );
    expect(get).toHaveBeenCalledWith(
      '/advertise/admin',
      expect.objectContaining({ ad_type: 'adsense', page: 1, size: 1 }),
    );
  });
});
