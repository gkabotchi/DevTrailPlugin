import { marked } from "marked";
import DOMPurify from "dompurify";
import { TagDef } from "./tags";

marked.setOptions({ gfm: true, breaks: true });

/** Convert composer markdown to sanitized HTML, prepending the tag marker. */
export function markdownToCommentHtml(markdown: string, tag: TagDef): string {
  const body = marked.parse(markdown) as string;
  const html = `<p><strong>${tag.marker}</strong></p>\n${body}`;
  return sanitize(html);
}

/** Render markdown for the live preview (no marker). */
export function markdownToPreviewHtml(markdown: string): string {
  return sanitize(marked.parse(markdown) as string);
}

/** Sanitize any HTML before injecting it into the DOM or sending it to ADO. */
export function sanitize(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      "p", "br", "strong", "em", "del", "blockquote", "code", "pre",
      "h1", "h2", "h3", "h4", "h5", "h6",
      "ul", "ol", "li", "a", "img", "table", "thead", "tbody", "tr", "th", "td", "hr"
    ],
    ALLOWED_ATTR: ["href", "src", "alt", "title", "target", "rel"]
  });
}

/** Strip tags to get plain text (used for tag detection). */
export function htmlToText(html: string): string {
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.textContent ?? "";
}
