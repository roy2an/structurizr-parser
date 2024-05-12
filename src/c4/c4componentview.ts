import { C4View } from "./c4view";

export class C4ComponentView extends C4View {

    private containerId: string;

    /**
     *
     */
    constructor(componentId:string, key?: string, description?: string, tags?: string) {
        super("Component", key, description, tags);
        this.containerId = componentId;
    }

    get ContainerId() {
        return this.containerId;
    }
}