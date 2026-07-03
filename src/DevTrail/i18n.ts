/** Minimal FR/EN i18n. Locale auto-detected from the browser, override-able. */

type Dict = Record<string, string>;

const en: Dict = {
  "app.loading": "Loading trail…",
  "app.unsaved": "Save the work item first — DevTrail attaches its history to saved items.",
  "app.empty": "No trail yet. The first card starts the story of this work item.",
  "app.error": "Something went wrong while talking to Azure DevOps. Reload the work item and try again.",
  "app.notAssignee": "Only the person this item is assigned to can post to the trail.",
  "composer.placeholder": "Write your update in markdown… (## headings, ``` code, - lists, ![images])",
  "composer.write": "Write",
  "composer.preview": "Preview",
  "composer.post": "Post to trail",
  "composer.posting": "Posting…",
  "composer.previewEmpty": "Nothing to preview yet.",
  "tag.progress": "Progress",
  "tag.blocker": "Blocker",
  "tag.solution": "Solution",
  "tag.info": "Info",
  "card.by": "Posted by {author} on {date}",
  "card.edited": "(edited)",
  "feed.refresh": "Refresh"
};

const fr: Dict = {
  "app.loading": "Chargement de la trace…",
  "app.unsaved": "Enregistrez d'abord l'élément — DevTrail attache son historique aux éléments enregistrés.",
  "app.empty": "Aucune trace pour l'instant. La première carte ouvre l'histoire de cet élément.",
  "app.error": "Une erreur est survenue avec Azure DevOps. Rechargez l'élément et réessayez.",
  "app.notAssignee": "Seule la personne assignée à cet élément peut publier sur la trace.",
  "composer.placeholder": "Rédigez votre mise à jour en markdown… (## titres, ``` code, - listes, ![images])",
  "composer.write": "Écrire",
  "composer.preview": "Aperçu",
  "composer.post": "Publier sur la trace",
  "composer.posting": "Publication…",
  "composer.previewEmpty": "Rien à prévisualiser pour l'instant.",
  "tag.progress": "Avancement",
  "tag.blocker": "Blocage",
  "tag.solution": "Solution",
  "tag.info": "Info",
  "card.by": "Publié par {author} le {date}",
  "card.edited": "(modifié)",
  "feed.refresh": "Actualiser"
};

let current: Dict = navigator.language?.toLowerCase().startsWith("fr") ? fr : en;
export const locale = (): "fr" | "en" => (current === fr ? "fr" : "en");
export const setLocale = (l: "fr" | "en") => { current = l === "fr" ? fr : en; };

export function t(key: string, vars?: Record<string, string>): string {
  let s = current[key] ?? en[key] ?? key;
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.replace(`{${k}}`, v);
  return s;
}
