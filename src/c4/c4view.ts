export class C4View {
    
    private type: "SystemLandscape" | "SystemContext" | "Container" | "Component";
    private key?: string;
    private description?: string;
    private tags?: string;
    private elements: any[] = [];
    private animations: any[] = [];

    constructor(type: "SystemLandscape" | "SystemContext" | "Container" | "Component", key?: string, description?: string, tags?: string) {
        this.type = type;
        this.key = key;
        this.description = description;
        this.tags = tags;
    }

    wildcardEntity() {
        
    }

    includeEntity(id:string) {
        this.elements.push({id});
    }

    excludeEntity(id:string) {
        for(let i = 0; i < this.elements.length; i++) {
            if(this.elements[i].id === id) {
                this.elements.splice(i, 1);
                break;
            }
        }
        // this.elements.push({id});
    }

    get Type() {
        return this.type;
    }

    get Key() {
        return this.key;
    }

    get Description() {
        return this.description;
    }

    get Elements() {
        return this.elements;
    }

    get Animations() {
        return this.animations;
    }
}