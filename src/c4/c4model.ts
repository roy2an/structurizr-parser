import { C4Group } from "./c4group";
import { C4Person } from "./c4person";
import { C4SoftwareSystem } from "./c4softwaresystem";

export class C4Model {

    private people:C4Person[] = [];
    private softwaresystems:C4SoftwareSystem[] = [];
    private groups:C4Group[] = [];

    constructor() {} 

    addGroup(group: C4Group) {
        this.groups.push(group);
    }

    addPerson(person: C4Person) {
        this.people.push(person);
    }

    addSoftwareSystem(ssys: C4SoftwareSystem) {
        this.softwaresystems.push(ssys);
    }

    addRelationship(s_id: string, t_id: string, desc: string) {
        // Find person in root Software Systems
        for (const per of this.people){
            const ele = per.findSourceElement(s_id);
            // If found, add relationship
            if (ele != undefined) {
                ele.addRelationship(t_id, desc);
                return;
            }
        }
        // Find entity in root Software Systems
        for (const element of this.softwaresystems){
            const ele = element.findSourceElement(s_id);
            // If found, add relationship
            if (ele != undefined) {
                ele.addRelationship(t_id, desc);
                return;
            }
        }
        // Find person or element in a group
        for (const grp of this.groups){
            if (grp.addRelationship(s_id, t_id, desc) === true){ return; };
        }
    }

    get People() {
        return this.people;
    }

    get SoftwareSystems() {
        return this.softwaresystems;
    }

    get Groups() {
        return this.groups;
    }
}