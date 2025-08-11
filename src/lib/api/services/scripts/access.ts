import { apiClient } from '../../client';
import { ListData, APIResponse, GroupMember, ScriptGroup } from '@/types/api';
import {
  InviteListItem,
  AccessRoleItem,
  InviteMessage,
} from '@/app/[locale]/script-show-page/[id]/types';

/**
 * 脚本访问控制API服务
 * 包含访问权限管理、用户组管理、邀请码管理等功能
 */
export class ScriptAccessService {
  private readonly basePath = '/scripts';

  // ========== 访问权限管理 ==========

  /**
   * 获取访问权限用户列表
   */
  async getAccessRoleList(id: number, page: number = 1) {
    return apiClient.get<ListData<AccessRoleItem>>(
      `${this.basePath}/${id}/access?page=${page}`,
    );
  }

  /**
   * 删除访问权限
   */
  async deleteAccess(id: number, aid: number) {
    return apiClient.delete(`${this.basePath}/${id}/access/${aid}`);
  }

  /**
   * 更新访问权限角色
   */
  async updateAccessRole(
    id: number,
    aid: string,
    option: {
      expiretime: number;
      role: 'visitor' | 'admin';
    },
  ) {
    return apiClient.put<{
      code: number;
      msg: string;
    }>(`${this.basePath}/${id}/access/${aid}`, {
      expiretime: option.expiretime,
      role: option.role,
    });
  }

  /**
   * 创建用户访问权限
   */
  async createAccessUser(
    id: number,
    option: {
      expiretime: number;
      role: string;
      user_id: number;
    },
  ) {
    return apiClient.post<{
      code: number;
      msg: string;
    }>(`${this.basePath}/${id}/access/user`, option);
  }

  /**
   * 创建用户组访问权限
   */
  async createAccessGroup(
    id: number,
    option: {
      expiretime: number;
      role: string;
      group_id: number;
    },
  ) {
    return apiClient.post<{
      code: number;
      msg: string;
    }>(`${this.basePath}/${id}/access/group`, option);
  }

  // ========== 用户组管理 ==========

  /**
   * 获取脚本组列表
   */
  async getScriptGroupList(id: number, page: number = 1) {
    return apiClient.get<ListData<ScriptGroup>>(
      `${this.basePath}/${id}/group`,
      { page },
    );
  }

  /**
   * 创建用户组
   */
  async createGroup(
    id: number,
    option: {
      name: string;
      description: string;
    },
  ) {
    return apiClient.post(`${this.basePath}/${id}/group`, option);
  }

  /**
   * 删除用户组
   */
  async deleteScriptGroup(id: number, gid: number) {
    return apiClient.delete(`${this.basePath}/${id}/group/${gid}`);
  }

  /**
   * 获取用户组成员列表
   */
  async getGroupMemberList(id: number, gid: number, page: number) {
    return apiClient.get<ListData<GroupMember>>(
      `${this.basePath}/${id}/group/${gid}/member`,
      { page },
    );
  }

  /**
   * 创建组成员
   */
  async createGroupUser(
    id: number,
    gid: number,
    option: {
      expiretime: number;
      user_id: number;
    },
  ) {
    return apiClient.post<{
      code: number;
      msg: string;
    }>(`${this.basePath}/${id}/group/${gid}/member`, option);
  }

  /**
   * 删除用户组成员
   */
  async deleteGroupUser(id: number, gid: number, mid: number) {
    return apiClient.delete<{
      code: number;
      msg: string;
    }>(`${this.basePath}/${id}/group/${gid}/member/${mid}`);
  }

  // ========== 邀请码管理 ==========

  /**
   * 创建邀请码
   */
  async createInvite(
    id: number,
    gid: number | undefined,
    option: {
      audit: boolean;
      count: number;
      days: number;
    },
  ) {
    const url =
      gid === undefined
        ? `${this.basePath}/${id}/invite/code`
        : `${this.basePath}/${id}/invite/group/${gid}/code`;

    return apiClient.post<{ code: string[] }>(url, option);
  }

  /**
   * 获取邀请码列表
   */
  async getInviteList(
    id: number,
    page: number = 1,
    gid?: number,
    sort?: { field: string; order: string },
  ) {
    const url =
      gid === undefined
        ? `${this.basePath}/${id}/invite/code`
        : `${this.basePath}/${id}/invite/group/${gid}/code`;

    return apiClient.get<ListData<InviteListItem>>(url, {
      page,
      size: 10,
      group_id: gid,
      sort: sort?.field,
      order: sort?.order,
    });
  }

  /**
   * 删除邀请码
   */
  async deleteInvite(id: number, inviteId: number) {
    return apiClient.delete(`${this.basePath}/${id}/invite/code/${inviteId}`);
  }

  /**
   * 允许/拒绝邀请码
   */
  async allowInviteCode(id: number, inviteId: number, status: number) {
    return apiClient.put<{
      code: number;
      msg: string;
    }>(`${this.basePath}/${id}/invite/code/${inviteId}/audit`, { status });
  }

  // 获取邀请信息
  async getInviteMessage(code: string) {
    return await apiClient.getWithCookie<InviteMessage>(`/scripts/invite/${code}`);
  }

  // 处理邀请接受/拒绝
  async handleInvite(code: string, accept: boolean) {
    return apiClient.put(`/scripts/invite/${code}/accept`, {
      accept: accept,
    });
  }
}

// 导出单例实例
export const scriptAccessService = new ScriptAccessService();
