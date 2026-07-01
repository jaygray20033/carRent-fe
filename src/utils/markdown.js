// src/utils/markdown.js
// Minimal, XSS-safe Markdown → HTML renderer for the admin blog preview.
// Strategy: escape ALL HTML entities first so no raw markup/script can survive,
// then apply a small, fixed set of Markdown transforms on the escaped text.
// This is a preview helper, not a full CommonMark implementation.

const escapeHtml = (s) =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

// Inline: bold, italic, inline code, links. Runs on already-escaped text.
const inline = (text) =>
  text
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    // [label](url) — only allow http(s) and relative URLs, never javascript:
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (m, label, url) => {
      const safe = /^(https?:\/\/|\/)/i.test(url.trim()) ? url.trim() : '#';
      return `<a href="${safe}" target="_blank" rel="noopener noreferrer">${label}</a>`;
    });

export const renderMarkdown = (src = '') => {
  if (!src || !src.trim()) return '';

  const lines = escapeHtml(src).replace(/\r\n/g, '\n').split('\n');
  const html = [];
  let listBuffer = [];
  let paragraphBuffer = [];

  const flushList = () => {
    if (listBuffer.length) {
      html.push(`<ul>${listBuffer.map((li) => `<li>${inline(li)}</li>`).join('')}</ul>`);
      listBuffer = [];
    }
  };
  const flushParagraph = () => {
    if (paragraphBuffer.length) {
      html.push(`<p>${inline(paragraphBuffer.join(' '))}</p>`);
      paragraphBuffer = [];
    }
  };

  for (const raw of lines) {
    const line = raw.trimEnd();

    if (!line.trim()) {
      flushList();
      flushParagraph();
      continue;
    }

    const heading = line.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      flushList();
      flushParagraph();
      const level = heading[1].length;
      html.push(`<h${level}>${inline(heading[2])}</h${level}>`);
      continue;
    }

    const listItem = line.match(/^\s*[-*]\s+(.*)$/);
    if (listItem) {
      flushParagraph();
      listBuffer.push(listItem[1]);
      continue;
    }

    flushList();
    paragraphBuffer.push(line.trim());
  }

  flushList();
  flushParagraph();
  return html.join('\n');
};

export default renderMarkdown;
