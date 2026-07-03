/**
 * DevTrail tag system.
 * The tag is stored *inside* the comment content as a leading "[TAG]" marker,
 * so the history stays portable: the native Discussion feed, exports and the
 * DevTrail cards all agree on the type.
 */

export type TagId = "BLOCAGE" | "SOLUTION" | "AVANCEMENT" | "INFO";

export interface TagDef {
  id: TagId;
  /** Marker written into the comment, e.g. [BLOCAGE] */
  marker: string;
  color: string;
  icon: string;
  labelKey: string; // i18n key
}

export const TAGS: TagDef[] = [
  { id: "AVANCEMENT", marker: "[AVANCEMENT]", color: "#107c10", icon: "✔", labelKey: "tag.progress" },
  { id: "BLOCAGE",    marker: "[BLOCAGE]",    color: "#cd4a45", icon: "⚠", labelKey: "tag.blocker"  },
  { id: "SOLUTION",   marker: "[SOLUTION]",   color: "#0078d4", icon: "🔧", labelKey: "tag.solution" },
  { id: "INFO",       marker: "[INFO]",       color: "#8a8886", icon: "ℹ", labelKey: "tag.info"     }
];

/** Default when a comment carries no recognized tag: green — everything good. */
export const DEFAULT_TAG: TagDef = TAGS[0];

const MARKER_RE = /^\s*\[(BLOCAGE|BLOCKER|SOLUTION|AVANCEMENT|PROGRESS|INFO)\]/i;

/** Detect the tag from the *text* of a comment (HTML already stripped). */
export function detectTag(plainText: string): TagDef {
  const m = MARKER_RE.exec(plainText);
  if (!m) return DEFAULT_TAG;
  const raw = m[1].toUpperCase();
  const normalized: TagId =
    raw === "BLOCKER" ? "BLOCAGE" : raw === "PROGRESS" ? "AVANCEMENT" : (raw as TagId);
  return TAGS.find(t => t.id === normalized) ?? DEFAULT_TAG;
}

/** Remove the leading marker so the card body doesn't repeat it. */
export function stripMarker(html: string): string {
  // The marker is stored as the very first thing in the HTML body,
  // typically as <p><strong>[TAG]</strong></p> produced by the composer.
  return html.replace(
    /^\s*(<p>\s*)?(<strong>\s*)?\[(BLOCAGE|BLOCKER|SOLUTION|AVANCEMENT|PROGRESS|INFO)\]\s*(<\/strong>)?\s*(<\/p>)?/i,
    m => (m.includes("<p>") && !m.includes("</p>") ? "<p>" : "")
  );
}
