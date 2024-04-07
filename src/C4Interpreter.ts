import { BaseStructurizrVisitor, StructurizrParser } from "./Parser";
import { C4Person } from "./c4/c4person";
import { C4Relationship } from "./c4/c4relationship";
import { C4SoftwareSystem } from "./c4/c4softwaresystem";
import { C4SystemContextView } from "./c4/c4systemcontextview";
import { C4SystemLandscapeView } from "./c4/c4systemlandscapeview";
import { C4Workspace } from "./c4/c4workspace";

class c4Interpreter extends BaseStructurizrVisitor {

    // This needs to be better
    private workspace:C4Workspace = new C4Workspace("","","");

    constructor() {
        super();
        this.validateVisitor();
    }

    // This is the top level entry point. It will recurse the entire Parser tree and then build MX files
    // based on the view instructions
    // At present it returns the workspace object but that will be changed once this works
    workspaceWrapper(node: any) {
        console.log('Here we are at workspaceWrapper node:');
        // this.theWorkspace.name = node.name;
        // this.theWorkspace.description = node.description;
        this.workspace = new C4Workspace("main", node.name, node.description);
        if (node.workspaceSection) {
            this.visit(node.workspaceSection);
        }
        // this.mxDrawings.push(this.mxWorkspace);
        // return this.mxDrawings;
        return this.workspace;
    }

    workspaceSection(node: any) {
        console.log('`Here we are at workspaceSection node:');
        if (node.modelSection) {
            this.visit(node.modelSection);
        }
        if (node.viewsSection) {
            this.visit(node.viewsSection);
        }
    }

    modelSection(node: any) {
        console.log('Here we are at modelSection node:');
        if (node.modelChildSection) {
            this.visit(node.modelChildSection);
        }
    }

    modelChildSection(node: any) {
        console.log('Here we are at modelChildSection node:');
        if (node.groupSection) { for (const group of node.groupSection) { this.visit(group); }}
        if (node.personSection) { for (const person of node.personSection) { this.visit(person); }}
        if (node.softwareSystemSection) { for (const sSystem of node.softwareSystemSection) { this.visit(sSystem); }}
        if (node.explicitRelationship) { for (const relationship of node. explicitRelationship) { this.visit(relationship); }}
        if (node.deploymentEnvironmentSection) { for (const depEnv of node.deploymentEnvironmentSection) { this.visit(depEnv); }}
    }

    groupSection(node: any) {
        console.log(`Here we are at groupSection with node: ${node.name}`);
        if (node.groupChildSection) {
            this.visit(node.groupChildSection);
        }
    }

    groupChildSection(node: any) {
        console.log(`Here we are at groupChildSection with node: ${node.name}`);
    }

    personSection(node: any) {
        console.log('Here we are at personSection node:');
        const id = node.identifier[0].image;
        const name = stripQuotes(node.StringLiteral[0]?.image ?? "");
        const description = stripQuotes(node.StringLiteral[1]?.image ?? "");
        const person = new C4Person(id, name, description);
        this.workspace.addPerson(person);
    }

    softwareSystemSection(node: any) {
        console.log('Here we are at softwareSystemSection node:');
        const id = node.identifier[0].image;
        const name = stripQuotes(node.StringLiteral[0]?.image ?? "");
        const description = stripQuotes(node.StringLiteral[1]?.image ?? "");
        const ssys = new C4SoftwareSystem(id, name, description);
        this.workspace.addSoftwareSystem(ssys);
    }

    softwareSystemChildSection(node: any) {
        console.log(`Here we are at softwareSystemChildSection with node: ${node.name}`);
    }

    containerSection(node: any) {
        console.log(`Here we are at ContainerSection with node: ${node.name}`);
    }

    containerChildSection(node: any) {
        console.log(`Here we are at ContainerChildSection with node: ${node.name}`);
    }

    componentSection(node: any) {
        console.log(`Here we are at ComponentSection with node: ${node.name}`);
    }

    explicitRelationship(node: any) {
        console.log('Here we are at explicitRelationship node:');
        const s_id = node.identifier[0].image;
        const t_id = node.identifier[1].image;
        const desc = stripQuotes(node.StringLiteral[0]?.image ?? "");
        this.workspace.addRelationship(s_id, t_id, desc);
    }

    implicitRelationship(node: any) {
        console.log(`Here we are at implicitRelationship with node: ${node.name}`);
    }

    deploymentEnvironmentSection(node: any) {
        console.log(`Here we are at deploymentEnvironmentSection with node: ${node.name}`);
    }

    deploymentEnvironmentChildSection(node: any) {
        console.log(`Here we are at deploymentEnvironmentChildSection with node: ${node.name}`);
    }

    deploymentNodeSection(node: any) {
        console.log(`Here we are at deploymentNodeSection with node: ${node.name}`);
    }

    deploymentNodeChildSection(node: any) {
        console.log(`Here we are at deploymentNodeChildSection with node: ${node.name}`);
    }

    containerInstanceSection(node: any) {
        console.log(`Here we are at containerInstanceSection with node: ${node.name}`);
    }

    softwareSystemInstanceSection(node: any) {
        console.log(`Here we are at softwareSystemInstanceSection with node: ${node.name}`);
    }

    viewsSection(node: any) {
        console.log('Here we are at viewsSection node:');
        if (node.viewsChildSection) {
            this.visit(node.viewsChildSection);
        }
    }

    viewsChildSection(node: any) {
        console.log('Here we are at viewsChildSection node:');
        if (node.systemLandscapeView) { for (const view of node.systemLandscapeView) { this.visit(view);} }
        if (node.systemContextView) { for (const view of node.systemContextView) { this.visit(view);} }
        if (node.containerView) { for (const view of node.containerView) { this.visit(view);} }
        if (node.componentView) { for (const view of node.componentView) { this.visit(view);} }
        if (node.imageSection) { for (const image of node.imageSection) { this.visit(image);} }
        if (node.stylesSection) { for (const style of node.stylesSection) { this.visit(style);} }
        if (node.dynamicSection) { for (const dyn of node.dynamicSection) { this.visit(dyn);} }
        if (node.deploymentSection) { for (const deployment of node.deploymentSection) { this.visit(deployment);} }
    }

    systemLandscapeView(node: any) {
        console.log(`Here we are at systemLandscapeView with node: ${node.name}`);
        const view = new C4SystemLandscapeView();
        this.workspace.addView(view);
    }

    viewOptions(node: any, view: any) {
        console.log('Here we are at viewOptions node:');
        if (node.includeOptions) { for (const inc of node.includeOptions) { this.visit(inc, view); } }
        if (node.autoLayoutOptions) { this.visit(node.autoLayoutOptions, view); }
        if (node.animationOptions) {}
        if (node.descriptionOptions) {}
        if (node.propertiesOptions) {}
    }

    includeOptions(node: any, view: any) {
        console.log('Here we are at includeOptions node:');
        // if (node.wildcard) { element.id = '*'; }
        // if (node.identifier) {
        //     element.id = e_id;
        // }
    }

    autoLayoutOptions(node: any, view: any) {
        console.log('Here we are at autoLayoutOptions node:');
        const rankDir = node.identifier?.[0].image ?? "TopBottom";
        const rankSep = node.int?.[0].image;
        const nodeSep = node.int?.[1].image;
    }

    animationOptions(node: any) {
        console.log(`Here we are at animationOptions with node: ${node.name}`);
    }

    descriptionOptions(node: any) {
        console.log(`Here we are at descriptionOptions with node: ${node.name}`);
    }

    propertiesOptions(node: any) {
        console.log(`Here we are at propertiesOptions with node: ${node.name}`);
    }

    systemContextView(node: any) {
        console.log('Here we are at systemContextView node:');
        const sws_id = node.identifier[0].image ?? "";
        const key = stripQuotes(node.StringLiteral[0]?.image ?? "");
        const desc = stripQuotes(node.StringLiteral[1]?.image ?? "");
        const view = new C4SystemContextView(sws_id, key, desc);
        this.workspace.addView(view);
        if (node.viewOptions) { this.visit(node.viewOptions, sws_id); }
    }

    containerView(node: any) {
        console.log(`Here we are at containerView with node: ${node.name}`);
    }

    componentView(node: any) { 
        console.log(`Here we are at componentView with node: ${node.name}`);
    }

    imageSection(node: any) {
        console.log(`Here we are at imageSection with node: ${node.name}`);
    }

    dynamicSection(node: any) {
        console.log(`Here we are at dynamicSection with node: ${node.name}`);
    }

    deploymentSection(node: any) {
        console.log(`Here we are at deploymentSection with node: ${node.name}`);
    }

    stylesSection(node: any) {
        console.log(`Here we are at stylesSection with node: ${node.name}`);
    }

    elementStyleSection(node: any) {
        console.log(`Here we are at elementStyleSection with node: ${node.name}`);
    }

    relationshipStyleSection(node: any) {
        console.log(`Here we are at relationshipStyleSection with node: ${node.name}`);
    }

    shapeStyle(node: any) {
        console.log(`Here we are at shapeStyle with node: ${node.name}`);
    }

    backgroundStyle(node: any) {
        console.log(`Here we are at backgroundStyle with node: ${node.name}`);
    }

    colorStyle(node: any) {
        console.log(`Here we are at colorStyle with node: ${node.name}`);
    }

    colourStyle(node: any) {
        console.log(`Here we are at colourStyle with node: ${node.name}`);
    }

    fontStyle(node: any) {
        console.log(`Here we are at fontStyle with node: ${node.name}`);
    }

    opacityStyle(node: any) {
        console.log(`Here we are at opacityStyle with node: ${node.name}`);
    }
}

export const C4Interpreter = new c4Interpreter();

// HELPER FUNCTIONS

function stripQuotes(str: string) : string {
    // Fail if an invalid argument is provided
    if (typeof str !== 'string') {
      throw new TypeError('Expected a string');
    }
    return str.replace(/^"(.+)"$/, '$1');
}