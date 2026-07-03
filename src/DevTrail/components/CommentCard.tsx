import * as React from "react";
import { detectTag, stripMarker } from "../tags";
import { htmlToText, sanitize } from "../markdown";
import { t } from "../i18n";
import { locale } from "../i18n";

export interface TrailComment {
  id: number;
  html: string;
  author: string;
  authorImage?: string;
  date: Date;
  edited: boolean;
}

export const CommentCard: React.FC<{ comment: TrailComment }> = ({ comment }) => {
  const tag = detectTag(htmlToText(comment.html));
  const body = sanitize(stripMarker(comment.html));

  const dateStr = comment.date.toLocaleString(locale() === "fr" ? "fr-FR" : "en-US", {
    dateStyle: "short",
    timeStyle: "short"
  });

  return (
    <article className="dt-card" style={{ borderLeftColor: tag.color }}>
      <header className="dt-card__header">
        <span className="dt-card__icon" style={{ color: tag.color }} aria-hidden="true">
          {tag.icon}
        </span>
        <span className="dt-card__tag" style={{ color: tag.color }}>
          {t(tag.labelKey)}
        </span>
        <span className="dt-card__meta">
          {t("card.by", { author: comment.author, date: dateStr })}
          {comment.edited && <em> {t("card.edited")}</em>}
        </span>
      </header>
      <div className="dt-card__body" dangerouslySetInnerHTML={{ __html: body }} />
    </article>
  );
};
