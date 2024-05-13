import { clone } from "lodash";
import { Exporter } from "./exporter";
import { Workspace, SoftwareSystem, Container, Component, Person, View, ContainerView, ComponentView } from "structurizr-typescript";

export class MermaidExporter extends Exporter {
    constructor(workspace: Workspace) {
        super(workspace);
    }

    export(key: string): string {
        const view = this.workspace.views.getViewWithKey(key) as View;
        let result = `C4Context\n`
        result += this.exportElementViews(view as View)
        result += this.exportRelationshipViews(view?.relationships as Array<any>)

        return result;
    }

    exportElementViews(view: View): string {
        let result = ""
        let elements = []
        for (let i = 0; i < view.elements.length; i++) {
            elements.push(view.elements[i].element.id)
        }
        for (let i = 0; i < elements.length; i++) {
            const element = this.workspace.model.getElement(elements[i])
            if ( element.parent && elements.indexOf(element.parent.id) === -1 ) {
                elements.splice(i, 0, element.parent.id)
                i -= 1
            }
        }
        
        for ( let i = 0; i < view.elements.length; i++ ) {
            let id = elements[i]
            const element = this.workspace.model.getElement(id)
            if ( element instanceof SoftwareSystem ) {
                const hasChild = element.containers.find((el) => elements.indexOf(el.id) !== -1)
                if (hasChild) {
                    result += `${new Array(2).join("    ")}System_Boundary(${element.id}, "${element.name}") {\n`
                    for (let container of element.containers) {
                        result += this.exportElement(container, elements)
                    }
                    result += `${new Array(2).join("    ")}}\n`
                } else {
                    result += `${new Array(2).join("    ")}System(${element.id}, "${element.name}", "${element.description || ''}")\n`
                }
            } else if ( element instanceof Container) {
                const hasChild = element.components.find((el) => elements.indexOf(el.id) !== -1)
                if (hasChild) {
                    result += `${new Array(2).join("    ")}Container_Boundary(${element.id}, "${element.name}") {\n`
                    for (let component of element.components) {
                        result += this.exportElement(component, elements)
                    }
                    result += `${new Array(2).join("    ")}}\n`
                } else {
                    result += `${new Array(2).join("    ")}Container(${element.id}, "${element.name}", "${element.technology || ''}", "${element.description || ''}")\n`
                }
                
            } else if ( element instanceof Component) {
                result += `${new Array(2).join("    ")}Component(${element.id}, "${element.name}, ${element.technology || ''}", "${element.description || ''}")\n`
            } else if ( element instanceof Person) {
                result += `${new Array(2).join("    ")}Person(${element.id}, "${element.name}", "${element.description || ''}")\n`
            }
        }
        return result;
    }

    exportElement(element: any, list: Array<any> = [], level = 3): string {
        let result = ""
        if ( element instanceof Container ) {
            const hasChild = element.components.find((el) => list.indexOf(el.id) !== -1)
            if (hasChild) {
                result += `${new Array(level).join("    ")}Container_Boundary(${element.id}, "${element.name}") {\n`
                for (let component of element.components) {
                    result += this.exportElement(component, list, level+1)
                }
                result += `${new Array(level).join("    ")}}\n`
            } else {
                result += `${new Array(level).join("    ")}Container(${element.id}, "${element.name}")\n`
            }
        } else if ( element instanceof Component) {
            result += `${new Array(level).join("    ")}Component(${element.id}, "${element.name}")\n`
        }
        list.splice(list.indexOf(element.id), 1)
        return result;
    }

    exportRelationshipViews(relationshipViews: Array<any>): string {
        let result = ""
        for (let relationshipView of relationshipViews) {
            result += `${new Array(2).join("    ")}Rel(${relationshipView.relationship.sourceId}, ${relationshipView.relationship.destinationId}, "${relationshipView.relationship.description}")\n`
        }
        return result;
    }

    exportSoftwareSystem(softwareSystem: any): string {
        let result = ""
        return result;
    }
}