import { apiClient } from '../client';

/**
 * 图片上传响应
 */
export interface ImageUploadResponse {
  id: number;
}

/**
 * 资源API服务
 */
export class ResourceService {
  private readonly basePath = '/resource';

  /**
   * 上传图片
   * @param image 图片文件
   * @param comment 注释
   * @param linkId 关联ID
   */
  async uploadImage(
    image: Blob | File,
    comment: string,
    linkId: number
  ): Promise<ImageUploadResponse> {
    const formData = new FormData();
    formData.append('image', image);
    formData.append('comment', comment);
    formData.append('link_id', linkId.toString());
    
    // 不要手动设置 Content-Type，让浏览器自动设置 multipart/form-data 和边界字符串
    return apiClient.post<ImageUploadResponse>(
      `${this.basePath}/image`,
      formData
    );
  }
}

// 导出服务实例
export const resourceService = new ResourceService();
