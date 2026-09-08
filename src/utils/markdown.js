/**
 * Simple markdown-to-HTML renderer.
 * Supports: **bold**, *italic*, `inline code`, ## headings, - bullet lists, line breaks.
 * Safe for local-only user data (no external input).
 */
export const renderMarkdownToHTML = (text) => {
  if (!text) return '';

  // Escape basic HTML to prevent accidental tag injection
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Headings (must come before bold processing)
  html = html.replace(/^### (.+)$/gm, '<h4 class="font-bold text-sm mt-3 mb-1 text-theme-text">$1</h4>');
  html = html.replace(/^## (.+)$/gm, '<h3 class="font-bold text-base mt-3 mb-1 text-theme-text">$1</h3>');
  html = html.replace(/^# (.+)$/gm, '<h2 class="font-bold text-lg mt-3 mb-1 text-theme-text">$1</h2>');

  // Bold & Italic (bold first to avoid conflict)
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong class="text-theme-text font-semibold">$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

  // Inline code
  html = html.replace(/`(.+?)`/g, '<code class="bg-theme-surface-subtle text-accent border border-theme-subtle px-1.5 py-0.5 rounded text-[0.85em] font-mono">$1</code>');

  // Bullet lists: consecutive lines starting with "- "
  html = html.replace(/(^- .+$(\n|$))+/gm, (match) => {
    const items = match.trim().split('\n').map((line) => {
      const content = line.replace(/^- /, '');
      return `<li class="ml-4 list-disc text-theme-muted">${content}</li>`;
    }).join('');
    return `<ul class="my-1 space-y-0.5">${items}</ul>`;
  });

  // Line breaks (but not after block elements)
  html = html.replace(/(?<!<\/h[234]>|<\/ul>|<\/li>)\n/g, '<br/>');

  return html;
};
