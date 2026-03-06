export function clampText(text: string, limit = 140) {
  if (!text) return "";
  return text.length <= limit ? text : `${text.slice(0, limit).trimEnd()}...`;
}
