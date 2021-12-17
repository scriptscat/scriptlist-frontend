import http from 'src/utils/http';

export function getRecommendList(url: string) {
  return http.get<API.ScriptListResponse>(url);
}

export function getAllScript(url: string) {
  return http.get<API.ScriptListResponse>(url)
}

export function getScriptInfo(scriptId: number) {
  return http.get<API.ScriptCodeResponse>('/scripts/' + scriptId.toString() + '/code')
}

export function updateScriptCode(id: number, content: string, code: string, definition: string, changelog: string, scriptPublic: DTO.ScriptPublic, unwell: DTO.ScriptUnwell) {
  const formData = new FormData();
  formData.append('content', content);
  formData.append('code', code);
  formData.append('changelog', changelog);
  formData.append('public', scriptPublic.toString());
  formData.append('unwell', unwell.toString());
  formData.append('definition', definition);
  return http.put<API.OkResponse>('/scripts/' + id.toString() + '/code', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
}

export function submitScript(content: string, code: string, type: DTO.ScriptType, scriptPublic: DTO.ScriptPublic, unwell: DTO.ScriptUnwell, definition: string, name: string, description: string) {
  const formData = new FormData();
  formData.append('content', content);
  formData.append('code', code);
  formData.append('type', type.toString());
  formData.append('public', scriptPublic.toString());
  formData.append('unwell', unwell.toString());
  formData.append('definition', definition);
  formData.append('name', name);
  formData.append('description', description);
  return http.post<API.SubmitScriptResponse>('/scripts', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
}
