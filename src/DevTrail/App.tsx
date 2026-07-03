import * as React from "react";
import * as SDK from "azure-devops-extension-sdk";
import {
  WorkItemTrackingServiceIds,
  IWorkItemFormService
} from "azure-devops-extension-api/WorkItemTracking";
import { CommonServiceIds, IProjectPageService } from "azure-devops-extension-api";
import { TagDef } from "./tags";
import { markdownToCommentHtml } from "./markdown";
import { getComments, addComment } from "./api";
import { t } from "./i18n";
import { CommentCard, TrailComment } from "./components/CommentCard";
import { Composer } from "./components/Composer";

interface AppProps {
  registerWorkItemListener: (cb: (workItemId: number) => void) => void;
}

type Status = "loading" | "unsaved" | "ready" | "error";

export const App: React.FC<AppProps> = ({ registerWorkItemListener }) => {
  const [status, setStatus] = React.useState<Status>("loading");
  const [comments, setComments] = React.useState<TrailComment[]>([]);
  const [isAssignee, setIsAssignee] = React.useState(false);
  const projectRef = React.useRef<string>("");
  const workItemIdRef = React.useRef<number>(0);

  const load = React.useCallback(async () => {
    try {
      const formService = await SDK.getService<IWorkItemFormService>(
        WorkItemTrackingServiceIds.WorkItemFormService
      );
      const projectService = await SDK.getService<IProjectPageService>(
        CommonServiceIds.ProjectPageService
      );
      const project = await projectService.getProject();
      const id = await formService.getId();

      if (!project || !id) {
        setStatus("unsaved");
        return;
      }
      projectRef.current = project.name;
      workItemIdRef.current = id;

      // Assignee gate: only the person the item is assigned to may post.
      // System.AssignedTo can come back as an identity object OR as a plain
      // string like "Display Name <email@domain>", depending on context —
      // handle both, matching by identity GUID first, then by email.
      const assignedTo = (await formService.getFieldValue("System.AssignedTo", {
        returnOriginalValue: false
      })) as
        | { id?: string; uniqueName?: string; displayName?: string }
        | string
        | undefined;

      const me = SDK.getUser(); // { id, name (email), displayName }

      let assigned = false;
      if (assignedTo && typeof assignedTo === "object") {
        assigned =
          (!!assignedTo.id && assignedTo.id === me.id) ||
          (!!assignedTo.uniqueName &&
            assignedTo.uniqueName.toLowerCase() === me.name?.toLowerCase());
      } else if (typeof assignedTo === "string" && assignedTo.length > 0) {
        // String form: "Display Name <email@domain>"
        const emailMatch = /<([^>]+)>/.exec(assignedTo);
        const email = emailMatch?.[1]?.toLowerCase();
        assigned = !!email && email === me.name?.toLowerCase();
      }
      setIsAssignee(assigned);

      const rest = await getComments(project.name, id);
      setComments(
        rest.map(c => ({
          id: c.id,
          html: c.renderedText || c.text || "",
          author: c.createdBy?.displayName ?? "?",
          authorImage: c.createdBy?._links?.avatar?.href,
          date: new Date(c.createdDate),
          edited: !!c.modifiedDate && c.modifiedDate !== c.createdDate
        }))
      );
      setStatus("ready");
    } catch (e) {
      console.error("DevTrail: failed to load trail", e);
      setStatus("error");
    } finally {
      SDK.resize();
    }
  }, []);

  React.useEffect(() => {
    registerWorkItemListener(() => void load());
    void load();
  }, [load, registerWorkItemListener]);

  const post = async (markdown: string, tag: TagDef) => {
    const html = markdownToCommentHtml(markdown, tag);
    await addComment(projectRef.current, workItemIdRef.current, html);
    await load();
  };

  if (status === "loading") return <div className="dt-state">{t("app.loading")}</div>;
  if (status === "unsaved") return <div className="dt-state">{t("app.unsaved")}</div>;
  if (status === "error") return <div className="dt-state dt-state--error">{t("app.error")}</div>;

  return (
    <div className="dt-root">
      {isAssignee ? (
        <Composer onPost={post} />
      ) : (
        <div className="dt-gate">{t("app.notAssignee")}</div>
      )}

      <div className="dt-feed">
        {comments.length === 0 ? (
          <div className="dt-state">{t("app.empty")}</div>
        ) : (
          comments.map(c => <CommentCard key={c.id} comment={c} />)
        )}
      </div>
    </div>
  );
};
