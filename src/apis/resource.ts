import http from 'src/utils/http';

export function uploadImage(image: Blob | File, comment: string) {
    const formData = new FormData();
    formData.append('image', image);
    formData.append('comment', comment);
    return http.post<API.UploadImage>('/resource/image', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
}