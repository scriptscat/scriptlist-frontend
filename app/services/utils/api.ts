import type { APIDataResponse } from '../http';
import { request } from '../http';

export async function UploadImage(
  image: Blob | File,
  comment: string,
  linkId: number
) {
  const formData = new FormData();
  formData.append('image', image);
  formData.append('comment', comment);
  formData.append('link_id', linkId.toString());
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
