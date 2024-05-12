import { Workspace } from "structurizr-typescript";

export class Exporter {
  workspace: Workspace;

  constructor(workspace: Workspace) {
    this.workspace = workspace;
  }
  export(view: string): string {
    return "";
  }
}