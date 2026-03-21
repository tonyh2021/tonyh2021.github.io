/** Strip markdown-ish syntax for short list previews (server + same logic as client lists). */
export function markdownExcerpt(markdown: string, maxLen = 140): string {
  const text = markdown
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`[^`]*`/g, "")
    .replace(/!\[.*?\]\(.*?\)/g, "")
    .replace(/\[([^\]]*)\]\(.*?\)/g, "$1")
    .replace(/#{1,6}\s/g, "")
    .replace(/[*_]{1,2}([^*_]+)[*_]{1,2}/g, "$1")
    .replace(/>\s/g, "")
    .replace(/\n+/g, " ")
    .trim();
  return text.length <= maxLen ? text : `${text.slice(0, maxLen)}…`;
}
