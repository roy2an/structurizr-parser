import { Exporter } from "./exporter";
import { Workspace } from "structurizr-typescript";

export class MermaidExporter extends Exporter {
    constructor(workspace: Workspace) {
        super(workspace);
    }

    export(view: string): string {
        console.log(this.workspace.views.getViewWithKey(view))
        return "";
    }
}