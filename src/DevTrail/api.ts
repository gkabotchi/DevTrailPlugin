import * as SDK from "azure-devops-extension-sdk";
import { CommonServiceIds, ILocationService } from "azure-devops-extension-api";

/**
 * The modern work item Comments API (/wit/workItems/{id}/comments) is not yet
 * exposed by the typed WorkItemTrackingRestClient in the extension API package
 * (it only has the legacy revision-based methods), so we call it directly
 * with the SDK access token. Same auth, same permissions (vso.work_write).
 */

const WIT_AREA_ID = "5264459e-e5e0-4bd8-b118-0985e68a4ec5";
const API_VERSION = "7.1-preview.4";

export interface RestComment {
  id: number;
  text: string;
  renderedText?: string;
  createdDate: string;
  modifiedDate?: string;
  createdBy: {
    displayName: string;
    _links?: { avatar?: { href: string } };
  };
}

interface CommentList {
  totalCount: number;
  count: number;
  comments: RestComment[];
}

let baseUrlPromise: Promise<string> | undefined;

async function baseUrl(): Promise<string> {
  if (!baseUrlPromise) {
    baseUrlPromise = SDK.getService<ILocationService>(CommonServiceIds.LocationService).then(
      loc => loc.getResourceAreaLocation(WIT_AREA_ID)
    );
  }
  return baseUrlPromise;
}

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  const [root, token] = await Promise.all([baseUrl(), SDK.getAccessToken()]);
  const res = await fetch(`${root}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: `application/json;api-version=${API_VERSION}`,
      ...(init?.headers ?? {})
    }
  });
  if (!res.ok) {
    throw new Error(`DevTrail API ${res.status}: ${await res.text()}`);
  }
  return (await res.json()) as T;
}

export async function getComments(project: string, workItemId: number): Promise<RestComment[]> {
  const data = await call<CommentList>(
    `${encodeURIComponent(project)}/_apis/wit/workItems/${workItemId}/comments` +
      `?$top=200&order=desc&$expand=renderedText&api-version=${API_VERSION}`
  );
  return data.comments;
}

export async function addComment(
  project: string,
  workItemId: number,
  html: string
): Promise<RestComment> {
  return call<RestComment>(
    `${encodeURIComponent(project)}/_apis/wit/workItems/${workItemId}/comments` +
      `?api-version=${API_VERSION}`,
    { method: "POST", body: JSON.stringify({ text: html }) }
  );
}
