import { BaseStructurizrVisitor } from "./Parser";
import { Container, RankDirection, SoftwareSystem, Workspace, ElementStyle, View, Shape } from "structurizr-typescript";

// This class creates a structurizr workspace object from the parsed DSL

class structurizrInterpreter extends BaseStructurizrVisitor {
    #debug: boolean = false;

    #relationships: any[] = []

    private elementsByIdentifier = new Map<string, string>(); // identifier, id
    private workspace: Workspace = new Workspace("",""); // Dummy object, should be overwritten when new Cst provided
    
    constructor() {
        super();

        this.validateVisitor();
    }

    setDebug(debug: boolean) {
        this.#debug = debug;
    }

    workspaceWrapper(node: any) {
        this.#debug && console.log('Here we are at workspaceWrapper node:');
        this.workspace = new Workspace("Name", "Description"); // Two options string literals after workspace keyword
        if (node.workspaceSection) {
            this.visit(node.workspaceSection);
        }

        return this.workspace;
    }

    workspaceSection(node: any) {
        this.#debug && console.log('`Here we are at workspaceSection node:');
        if (node.modelSection) {
            this.visit(node.modelSection);
        }
        for (const { sourceName, destinationName, desc, ctr, type } of this.#relationships) {
            let sId = ''
            let dId = ''
            if (type === 'implicit') {
                sId = ctr.id
                dId = this.elementsByIdentifier.get(destinationName) as string
            }
            else {
                sId = sourceName === 'this' ? ctr.id : this.elementsByIdentifier.get(sourceName) as string
                dId = destinationName === 'this' ? ctr.id : this.elementsByIdentifier.get(destinationName) as string
            }

            const source = this.workspace.model.getElement(sId);
            const target = this.workspace.model.getElement(dId);
            this.workspace.model.addRelationship(source, target, desc);
        }
        if (node.viewsSection) {
            this.visit(node.viewsSection);
        }
    }

    modelSection(node: any) {
        this.#debug && console.log('Here we are at modelSection node:');
        if (node.modelChildSection) {
            this.visit(node.modelChildSection);
        }
    }

    modelChildSection(node: any) {
        this.#debug && console.log('Here we are at modelChildSection node:');
        if (node.groupSection) { for (const group of node.groupSection) { this.visit(group); }}
        if (node.personSection) { for (const person of node.personSection) { this.visit(person); }}
        if (node.softwareSystemSection) { for (const sSystem of node.softwareSystemSection) { this.visit(sSystem); }}
        if (node.explicitRelationship) { for (const relationship of node. explicitRelationship) { this.visit(relationship); }}
        if (node.deploymentEnvironmentSection) { for (const depEnv of node.deploymentEnvironmentSection) { this.visit(depEnv); }}
    }

    groupSection(node: any) {
        this.#debug && console.log(`Here we are at groupSection with node: ${node.name}`);
        // We do not seem to have group elements supported?!
        // const g = this.workspace.model.
        // Just iterate over child elements for now
    }

    groupChildSection(node: any) {
        this.#debug && console.log(`Here we are at groupChildSection with node: ${node.name}`);
    }

    personSection(node: any) {
        this.#debug && console.log('Here we are at personSection node:');
        const name = node.StringLiteral[0]?.image ?? "";
        const desc = node.StringLiteral[1]?.image ?? "";
        const p = this.workspace.model.addPerson(stripQuotes(name), stripQuotes(desc));
        if (node.identifier && p) {
            this.elementsByIdentifier.set(stripQuotes(node.identifier[0].image), p.id);
        }
    }

    softwareSystemSection(node: any) {
        this.#debug && console.log('Here we are at softwareSystemSection node:');
        const name = node.StringLiteral[0]?.image ?? "";
        const desc = node.StringLiteral[1]?.image ?? "";
        const s = this.workspace.model.addSoftwareSystem(stripQuotes(name), stripQuotes(desc));
        if (node.identifier && s) {
            this.elementsByIdentifier.set(stripQuotes(node.identifier[0].image), s.id);
        }
        if (node.softwareSystemChildSection){ this.visit(node.softwareSystemChildSection, s); }
    }

    softwareSystemChildSection(node: any, ssys: SoftwareSystem) {
        this.#debug && console.log(`Here we are at softwareSystemChildSection with node: ${node.name}`);
        if (node.containerSection) { for (const ctr of node.containerSection) { this.visit(ctr, ssys); }}
        if (node.explicitRelationship) { for (const relationship of node.explicitRelationship) { this.visit(relationship, ssys); }}
        if (node.implicitRelationship) { for (const relationship of node.implicitRelationship) { this.visit(relationship, ssys); }}
    }

    containerSection(node: any, ssys: SoftwareSystem) {
        this.#debug && console.log(`Here we are at ContainerSection with node: ${node.name}`);
        const id = stripQuotes(node.identifier[0].image);
        const name = stripQuotes(node.StringLiteral[0]?.image ?? "");
        const description = stripQuotes(node.StringLiteral[1]?.image ?? "");
        const technology = stripQuotes(node.StringLiteral[2]?.image ?? "");
        const s = this.workspace.model.addContainer(ssys, name, description, technology)
        if (node.identifier && s) {
            this.elementsByIdentifier.set(id, s.id);
        }
        if (node.containerChildSection) { this.visit(node.containerChildSection, s)}
    }

    containerChildSection(node: any, ctr: Container) {
        this.#debug && console.log(`Here we are at ContainerChildSection with node: ${node.name}`);
        this.#debug && console.log('Here we are at ContainerChildSection node:');
        if (node.componentSection) { for (const comp of node.componentSection) { this.visit(comp, ctr); }}
        if (node.explicitRelationship) { for (const relationship of node.explicitRelationship) { this.visit(relationship, ctr); }}
        if (node.implicitRelationship) { for (const relationship of node.implicitRelationship) { this.visit(relationship, ctr); }}
    }

    componentSection(node: any, ctr: Container) {
        this.#debug && console.log(`Here we are at ComponentSection with node: ${node.name}`);
        const id = stripQuotes(node.identifier[0].image);
        const name = stripQuotes(node.StringLiteral[0]?.image ?? "");
        const description = stripQuotes(node.StringLiteral[1]?.image ?? "");
        const tags = stripQuotes(node.StringLiteral[2]?.image ?? "");
        const s = this.workspace.model.addComponent(ctr, name, description, tags)
        if (node.identifier && s) {
            this.elementsByIdentifier.set(id, s.id);
        }
    }

    explicitRelationship(node: any, ctr: Container | SoftwareSystem) {
        this.#debug && console.log('Here we are at explicitRelationship node:');
        const sourceName = node.identifier[0].image;
        const destinationName = node.identifier[1].image;
        const desc = stripQuotes(node.StringLiteral[0]?.image ?? "")
        this.#relationships.push({ sourceName, destinationName, desc, type: "explicit", ctr })
    }

    implicitRelationship(node: any, ctr: Container | SoftwareSystem) {
        this.#debug && console.log(`Here we are at implicitRelationship with node: ${node.name}`);
        const sourceName = ctr.id;
        const destinationName = node.identifier[0].image;
        const desc = stripQuotes(node.StringLiteral[0]?.image ?? "")
        this.#relationships.push({ sourceName, destinationName, desc, type: "implicit", ctr })
    }

    deploymentEnvironmentSection(node: any) {
        this.#debug && console.log(`Here we are at deploymentEnvironmentSection with node: ${node.name}`);
    }

    deploymentEnvironmentChildSection(node: any) {
        this.#debug && console.log(`Here we are at deploymentEnvironmentChildSection with node: ${node.name}`);
    }

    deploymentNodeSection(node: any) {
        this.#debug && console.log(`Here we are at deploymentNodeSection with node: ${node.name}`);
    }

    deploymentNodeChildSection(node: any) {
        this.#debug && console.log(`Here we are at deploymentNodeChildSection with node: ${node.name}`);
    }

    containerInstanceSection(node: any) {
        this.#debug && console.log(`Here we are at containerInstanceSection with node: ${node.name}`);
    }

    softwareSystemInstanceSection(node: any) {
        this.#debug && console.log(`Here we are at softwareSystemInstanceSection with node: ${node.name}`);
    }

    viewsSection(node: any) {
        this.#debug && console.log('Here we are at viewsSection node:');
        if (node.viewsChildSection) {
            this.visit(node.viewsChildSection);
        }
    }

    viewsChildSection(node: any) {
        this.#debug && console.log('Here we are at viewsChildSection node:');
        if (node.systemLandscapeView) { for (const view of node.systemLandscapeView) { this.visit(view);} }
        if (node.systemContextView) { for (const view of node.systemContextView) { this.visit(view);} }
        if (node.containerView) { for (const view of node.containerView) { this.visit(view);} }
        if (node.componentView) { for (const view of node.componentView) { this.visit(view);} }
        if (node.imageSection) { for (const image of node.imageSection) { this.visit(image);} }
        if (node.stylesSection) { for (const style of node.stylesSection) { this.visit(style);} }
        if (node.dynamicSection) { for (const dyn of node.dynamicSection) { this.visit(dyn);} }
        if (node.deploymentSection) { for (const deployment of node.deploymentSection) { this.visit(deployment);} }
    }

    viewOptions(node: any, view: any) {
        this.#debug && console.log('Here we are at viewOptions node:');
        if (node.includeOptions) { for (const inc of node.includeOptions) { this.visit(inc, view); } }
        if (node.excludeOptions) { for (const inc of node.excludeOptions) { this.visit(inc, view); } }
        if (node.autoLayoutOptions) { this.visit(node.autoLayoutOptions, view); }
        if (node.animationOptions) {}
        if (node.descriptionOptions) {}
        if (node.propertiesOptions) {}
    }

    includeOptions(node: any, view: any) {
        this.#debug && console.log('Here we are at includeOptions node:');
        if (node.wildcard) { view.addAllElements(); }
        if (node.identifier) {
            const e_id = this.elementsByIdentifier.get(node.identifier[0].image) ?? "";
            const ele = this.workspace.model.getElement(e_id);
            if (ele) {
                view.addElement(ele, true);
            }
        }
    }

    excludeOptions(node: any, view: any) {
        this.#debug && console.log('Here we are at includeOptions node:');
        // if (node.wildcard) { view.addAllElements(); }
        if (node.identifier) {
            const e_id = this.elementsByIdentifier.get(node.identifier[0].image) ?? "";
            const ele = this.workspace.model.getElement(e_id);
            if (ele) {
                view.removeElement(ele);
            }
        }
    }

    autoLayoutOptions(node: any, view: any) {
        this.#debug && console.log('Here we are at autoLayoutOptions node:');
        const rankDir = node.identifier?.[0].image;
        const rankSep = node.int?.[0].image;
        const nodeSep = node.int?.[1].image;
        let rankDirEnum: RankDirection = RankDirection.TopBottom;
        if (rankDir) {
            switch (rankDir) {
                case 'tb': rankDirEnum = RankDirection.TopBottom; break;
                case 'bt': rankDirEnum = RankDirection.BottomTop; break;
                case 'lr': rankDirEnum = RankDirection.LeftRight; break;
                case 'rl': rankDirEnum = RankDirection.RightLeft; break;
            }
            view.setAutomaticLayout(rankDirEnum, rankSep, nodeSep);
        } else {
            view.setAutomaticLayout(true);
        }
    }

    animationOptions(node: any) {
        this.#debug && console.log(`Here we are at animationOptions with node: ${node.name}`);
    }

    descriptionOptions(node: any) {
        this.#debug && console.log(`Here we are at descriptionOptions with node: ${node.name}`);
    }

    propertiesOptions(node: any) {
        this.#debug && console.log(`Here we are at propertiesOptions with node: ${node.name}`);
    }

    systemLandscapeView(node: any) {
        this.#debug && console.log(`Here we are at systemLandscapeView with node: ${node.name}`);
    }

    systemContextView(node: any) {
        this.#debug && console.log('Here we are at systemContextView node:');
        const sws_id = this.elementsByIdentifier.get(node.identifier[0].image) ?? "";
        const sws = this.workspace.model.getElement(sws_id);
        const key = node.StringLiteral[0]?.image ?? "";
        const desc = node.StringLiteral[1]?.image ?? "";
        const view = this.workspace.views.createSystemContextView(sws as SoftwareSystem, stripQuotes(key), stripQuotes(desc));
        if (node.viewOptions) { this.visit(node.viewOptions, view); }
    }

    containerView(node: any) {
        this.#debug && console.log(`Here we are at containerView with node: ${node.name}`);
        const sws_id = this.elementsByIdentifier.get(node.identifier[0].image) ?? "";
        const sws = this.workspace.model.getElement(sws_id);
        const key = node.StringLiteral[0]?.image ?? "";
        const desc = node.StringLiteral[1]?.image ?? "";
        const view = this.workspace.views.createContainerView(sws as SoftwareSystem, stripQuotes(key), stripQuotes(desc));
        if (node.viewOptions) { this.visit(node.viewOptions, view); }
    }

    componentView(node: any) { 
        this.#debug && console.log(`Here we are at componentView with node: ${node.name}`);
        const sws_id = this.elementsByIdentifier.get(node.identifier[0].image) ?? "";
        const sws = this.workspace.model.getElement(sws_id);
        const key = node.StringLiteral[0]?.image ?? "";
        const desc = node.StringLiteral[1]?.image ?? "";
        const view = this.workspace.views.createComponentView(sws as Container, stripQuotes(key), stripQuotes(desc));
        if (node.viewOptions) { this.visit(node.viewOptions, view); }
    }

    imageSection(node: any) {
        this.#debug && console.log(`Here we are at imageSection with node: ${node.name}`);
    }

    dynamicSection(node: any) {
        this.#debug && console.log(`Here we are at dynamicSection with node: ${node.name}`);
    }

    deploymentSection(node: any) {
        this.#debug && console.log(`Here we are at deploymentSection with node: ${node.name}`);
    }

    stylesSection(node: any) {
        this.#debug && console.log(`Here we are at stylesSection with node: ${node.name}`);
        if (node.elementStyleSection) { for (const style of node.elementStyleSection) { this.visit(style); } }
        if (node.relationshipStyleSection) { for (const style of node.relationshipStyleSection) { this.visit(style); } }
    }

    elementStyleSection(node: any) {
        this.#debug && console.log(`Here we are at elementStyleSection with node: ${node.name}`);
        const tag = stripQuotes(node.StringLiteral[0].image);
        const eleStyle = new ElementStyle(tag)

        this.workspace.views.configuration.styles.addElementStyle(eleStyle);

        if (node.shapeStyle) { for (const style of node.shapeStyle)  { this.visit(style, eleStyle); } }
        if (node.backgroundStyle) { for (const style of node.backgroundStyle)  { this.visit(style, eleStyle); } }
        if (node.colorStyle) { for (const style of node.colorStyle)  { this.visit(style, eleStyle); } }
        if (node.colourStyle) { for (const style of node.colourStyle)  { this.visit(style, eleStyle); } }
        if (node.fontStyle) { for (const style of node.fontStyle)  { this.visit(style, eleStyle); } }
        if (node.opacityStyle) { for (const style of node.opacityStyle)  { this.visit(style, eleStyle); } }
    }

    relationshipStyleSection(node: any) {
        this.#debug && console.log(`Here we are at relationshipStyleSection with node: ${node.name}`);
        const tag = stripQuotes(node.StringLiteral[0].image);
        const eleStyle = new ElementStyle(tag)

        this.workspace.views.configuration.styles.addElementStyle(eleStyle);

        if (node.thicknessStyle) { for (const style of node.thicknessStyle)  { this.visit(style, eleStyle); } }
        if (node.colorStyle) { for (const style of node.colorStyle)  { this.visit(style, eleStyle); } }
        if (node.colourStyle) { for (const style of node.colourStyle)  { this.visit(style, eleStyle); } }
        if (node.styleStyle) { for (const style of node.style)  { this.visit(style, eleStyle); } }
        if (node.routingStyle) { for (const style of node.routingStyle)  { this.visit(style, eleStyle); } }
        if (node.fontSizeStyle) { for (const style of node.fontSizeStyle)  { this.visit(style, eleStyle); } }
        if (node.widthStyle) { for (const style of node.widthStyle)  { this.visit(style, eleStyle); } }
        if (node.positionStyle) { for (const style of node.positionStyle)  { this.visit(style, eleStyle); } }
        if (node.opacityStyle) { for (const style of node.opacityStyle)  { this.visit(style, eleStyle); } }
        if (node.propertiesStyle) { for (const style of node.propertiesStyle)  { this.visit(style, eleStyle); } }
    }

    shapeStyle(node: any, style: ElementStyle) {
        this.#debug && console.log(`Here we are at shapeStyle with node: ${node.name}`);
        if ( node.person ) { style.shape = node.person[0].image; }
        if ( node.shapeEnum ) { style.shape = node.shapeEnum[0].image; }
    }

    backgroundStyle(node: any, style: ElementStyle) {
        this.#debug && console.log(`Here we are at backgroundStyle with node: ${node.name}`);
        if ( node.hexColor ) { style.background = stripQuotes(node.hexColor[0].image); }
    }

    colorStyle(node: any, style: ElementStyle) {
        this.#debug && console.log(`Here we are at colorStyle with node: ${node.name}`);
        if ( node.hexColor ) { style.background = stripQuotes(node.hexColor[0].image); }
    }

    colourStyle(node: any, style: ElementStyle) {
        this.#debug && console.log(`Here we are at colourStyle with node: ${node.name}`);
    }

    fontStyle(node: any, style: ElementStyle) {
        this.#debug && console.log(`Here we are at fontStyle with node: ${node.name}`);
    }

    opacityStyle(node: any, style: ElementStyle) {
        this.#debug && console.log(`Here we are at opacityStyle with node: ${node.name}`);
    }
}

function stripQuotes(str: string) : string {
    // Fail if an invalid argument is provided
    if (typeof str !== 'string') {
      throw new TypeError('Expected a string');
    }
    return str.replace(/^"(.+)"$/, '$1');
  }

export const StructurizrInterpreter = new structurizrInterpreter();