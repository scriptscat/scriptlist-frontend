'use client';

import { useState } from 'react';
import { userService } from '../services/user';

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
