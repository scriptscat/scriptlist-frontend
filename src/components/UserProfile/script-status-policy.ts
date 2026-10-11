interface ScriptViewer {
  user_id: number;
  is_admin: number;
}

export function canViewDeletedScripts(
  profileUserId: number,
  viewer: ScriptViewer | null | undefined,
) {
  return viewer?.user_id === profileUserId || (viewer?.is_admin ?? 0) >= 1;
}
