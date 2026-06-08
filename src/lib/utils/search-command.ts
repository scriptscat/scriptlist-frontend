const CODE_SEARCH_COMMAND = /^\/code(?:\s+|:|$)(.*)$/i;

export function isCodeSearchCommand(value: string) {
  return CODE_SEARCH_COMMAND.test(value.trim());
}

export function getScriptSearchPath(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return '/search';
  }

  const codeCommand = trimmed.match(CODE_SEARCH_COMMAND);
  if (!codeCommand) {
    return `/search?keyword=${encodeURIComponent(trimmed)}`;
  }

  const keyword = codeCommand[1].trim();
  return keyword
    ? `/scripts/code-search?keyword=${encodeURIComponent(keyword)}`
    : '/scripts/code-search';
}
