import { afterEach, describe, expect, it, vi } from 'vitest';
import { adminService } from './admin';
import { apiClient } from '../client';
import { API_CONFIG } from '../config';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('adminService.testAIConfig', () => {
  it('把未保存的表单值发给后端，并放宽超时', async () => {
    const post = vi.spyOn(apiClient, 'post').mockResolvedValue({
      model: 'gpt-test',
      content: 'pong',
      prompt_tokens: 5,
      completion_tokens: 1,
      latency_ms: 120,
    } as never);

    await adminService.testAIConfig({
      base_url: 'https://form.example.com',
      api_key: 'sk-form',
      model: 'gpt-test',
      system_prompt: 'sys',
      user_prompt: 'ping',
    });

    expect(post).toHaveBeenCalledWith(
      '/admin/system-configs/ai-test',
      {
        base_url: 'https://form.example.com',
        api_key: 'sk-form',
        model: 'gpt-test',
        system_prompt: 'sys',
        user_prompt: 'ping',
      },
      // 默认 20s 对 AI 首字延迟不够，测试调用单独放宽
      { timeout: API_CONFIG.aiTestTimeout },
    );
  });

  it('返回上游的真实反馈，便于判断配置是否生效', async () => {
    vi.spyOn(apiClient, 'post').mockResolvedValue({
      model: 'gpt-test',
      content: 'pong',
      prompt_tokens: 5,
      completion_tokens: 1,
      latency_ms: 120,
    } as never);

    await expect(
      adminService.testAIConfig({ model: 'gpt-test' }),
    ).resolves.toEqual({
      model: 'gpt-test',
      content: 'pong',
      prompt_tokens: 5,
      completion_tokens: 1,
      latency_ms: 120,
    });
  });
});
