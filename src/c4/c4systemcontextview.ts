import { C4View } from "./c4view";

export class C4SystemContextView extends C4View {

    private softwareSystemId: string;
    /**
     *
     */
    constructor(systemId: string, key?:string,  description?: string, tags?: string) {
        super("SystemContext", key, description, tags);
        this.softwareSystemId = systemId;
    }

    get SoftwareSystemId() {
        return this.softwareSystemId;
    }
}