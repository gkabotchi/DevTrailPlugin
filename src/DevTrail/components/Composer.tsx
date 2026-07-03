import * as React from "react";
import { TAGS, DEFAULT_TAG, TagDef } from "../tags";
import { markdownToPreviewHtml } from "../markdown";
import { t } from "../i18n";

interface ComposerProps {
  onPost: (markdown: string, tag: TagDef) => Promise<void>;
}

export const Composer: React.FC<ComposerProps> = ({ onPost }) => {
  const [tagId, setTagId] = React.useState(DEFAULT_TAG.id);
  const [markdown, setMarkdown] = React.useState("");
  const [mode, setMode] = React.useState<"write" | "preview">("write");
  const [posting, setPosting] = React.useState(false);

  const tag = TAGS.find(x => x.id === tagId) ?? DEFAULT_TAG;
  const canPost = markdown.trim().length > 0 && !posting;

  const submit = async () => {
    if (!canPost) return;
    setPosting(true);
    try {
      await onPost(markdown, tag);
      setMarkdown("");
      setMode("write");
    } finally {
      setPosting(false);
    }
  };

  return (
    <section className="dt-composer" style={{ borderLeftColor: tag.color }}>
      <div className="dt-composer__bar">
        <select
          className="dt-composer__tag"
          value={tagId}
          onChange={e => setTagId(e.target.value as TagDef["id"])}
          aria-label="Type"
        >
          {TAGS.map(x => (
            <option key={x.id} value={x.id}>
              {x.icon} {t(x.labelKey)}
            </option>
          ))}
        </select>

        <div className="dt-composer__tabs" role="tablist">
          <button
            role="tab"
            aria-selected={mode === "write"}
            className={mode === "write" ? "is-active" : ""}
            onClick={() => setMode("write")}
          >
            {t("composer.write")}
          </button>
          <button
            role="tab"
            aria-selected={mode === "preview"}
            className={mode === "preview" ? "is-active" : ""}
            onClick={() => setMode("preview")}
          >
            {t("composer.preview")}
          </button>
        </div>
      </div>

      {mode === "write" ? (
        <textarea
          className="dt-composer__input"
          placeholder={t("composer.placeholder")}
          value={markdown}
          onChange={e => setMarkdown(e.target.value)}
          rows={6}
        />
      ) : (
        <div
          className="dt-composer__preview dt-card__body"
          dangerouslySetInnerHTML={{
            __html: markdown.trim()
              ? markdownToPreviewHtml(markdown)
              : `<p><em>${t("composer.previewEmpty")}</em></p>`
          }}
        />
      )}

      <div className="dt-composer__actions">
        <button className="dt-btn-primary" disabled={!canPost} onClick={() => void submit()}>
          {posting ? t("composer.posting") : t("composer.post")}
        </button>
      </div>
    </section>
  );
};
