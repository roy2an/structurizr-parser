import { C4View } from "./c4view";

export class C4ComponentView extends C4View {

    private componentID: string;

    /**
     *
     */
    constructor(componentId:string, key?: string, description?: string, tags?: string) {
        super("Component", key, description, tags);
        this.componentID = componentId;
    }

    get ComponentId() {
        return this.componentID;
    }
}