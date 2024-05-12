import { C4View } from "./c4view";

export class C4ContainerView extends C4View {

    private softwareSystemId: string;
    /**
     *
     */
    constructor(softwareSystemId:string, key?: string, description?: string, tags?: string) {
        super("Container", key, description ,tags);
        this.softwareSystemId = softwareSystemId;
    }

    get SoftwareSystemId() {
        return this.softwareSystemId;
    }
}