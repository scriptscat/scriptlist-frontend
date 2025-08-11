import useSWR from 'swr';
import { userService, GetUserDetailResponse } from '../services/user';
import { APIError } from '@/types/api';
import { useState } from 'react';

/**
 * 获取用户详细信息的hook
 * @param uid 用户ID
 * @param shouldFetch 是否应该请求数据，默认为true
 */
export function useUserDetail(uid: number | undefined, shouldFetch: boolean = true) {
  const key = uid && shouldFetch ? ['user-detail', uid] : null;
  
  return useSWR<GetUserDetailResponse, APIError>(
    key,
    () => userService.getUserDetail(uid!),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      // 缓存时间5分钟
      dedupingInterval: 5 * 60 * 1000,
      // 错误重试配置
      errorRetryCount: 3,
      errorRetryInterval: 1000,
    }
  );
}

/**
 * 获取用户列表搜索的hook
 * @param query 搜索关键词
 * @param shouldFetch 是否应该请求数据，默认为true
 */
export function useUserList(query: string, shouldFetch: boolean = true) {
  const key = query && shouldFetch ? ['user-list', query] : null;
  
  return useSWR(
    key,
    () => userService.getUserList(query),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      // 搜索结果缓存时间1分钟
      dedupingInterval: 60 * 1000,
    }
  );
}

/**
 * 关注用户的hook
 * @returns 包含关注状态、loading状态和关注/取消关注方法的对象
 */
export function useFollowUser() {
  const [loading, setLoading] = useState(false);

  const followUser = async (uid: number, isCurrentlyFollowing: boolean) => {
    setLoading(true);
    try {
      // 如果当前已关注，则传入 unfollow: true 来取消关注
      // 如果当前未关注，则传入 unfollow: false 来关注
      await userService.followUser(uid, isCurrentlyFollowing);
      return !isCurrentlyFollowing; // 返回新的关注状态
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    followUser,
  };
}
