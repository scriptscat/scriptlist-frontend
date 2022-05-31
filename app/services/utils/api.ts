import type { APIDataResponse } from '../http';
import { request } from '../http';

export async function UploadImage(image: Blob | File, comment: string) {
  const formData = new FormData();
  formData.append('image', image);
  formData.append('comment', comment);
  const resp = await request<APIDataResponse<{ id: number }>>({
    url: '/resource/image',
    method: 'POST',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return resp.data;
}
