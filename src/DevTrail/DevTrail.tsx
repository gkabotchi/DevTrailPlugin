import * as React from "react";
import * as ReactDOM from "react-dom";
import * as SDK from "azure-devops-extension-sdk";
import { App } from "./App";
import "./styles.css";

/**
 * Entry point for the DevTrail work-item form group.
 *
 * Order matters: SDK.init() must complete its handshake with the host BEFORE
 * SDK.getContributionId() / SDK.register() are usable. Registering at module
 * top-level throws and makes the whole group "fail to load".
 */

let notifyWorkItemChanged: ((workItemId: number) => void) | undefined;

async function start() {
  await SDK.init({ loaded: false, applyTheme: true });

  // Now that the handshake is done, register for form lifecycle events.
  SDK.register(SDK.getContributionId(), () => ({
    onLoaded: (args: { id: number }) => notifyWorkItemChanged?.(args.id),
    onSaved: (args: { id: number }) => notifyWorkItemChanged?.(args.id),
    onRefreshed: (args: { id: number }) => notifyWorkItemChanged?.(args.id),
    onReset: () => undefined,
    onUnloaded: () => undefined,
    onFieldChanged: () => undefined
  }));

  ReactDOM.render(
    <App registerWorkItemListener={cb => { notifyWorkItemChanged = cb; }} />,
    document.getElementById("root")
  );

  await SDK.notifyLoadSucceeded();
  SDK.resize();
}

start().catch(err => {
  console.error("DevTrail: failed to start", err);
  SDK.notifyLoadFailed(err instanceof Error ? err : String(err));
});
