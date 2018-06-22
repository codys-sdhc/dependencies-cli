import fs = require('fs');
import {Node, NodeGroup} from '../lib/componentGraph';

export class ClusterPackager {

    constructor(private outputFolder: string) { }

    public writeXMLNodes(n: Node[]) {
        // Make output folder
        const dir = this.outputFolder + '/';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }

        const dest = dir + 'package.xml';
        let text = this.writeHeader();

        const typeMap = this.separateIntoGroupsFromNodes(n);
        Array.from(typeMap.entries()).forEach(pair => {
            text = text.concat((this.writeType(pair[0], pair[1]) as String).valueOf());
        });

        text = text.concat(this.writeFooter());

        fs.writeFile(dest, text, err => {
            // throws an error, you could also catch it here
            if (err) {
                throw err;
            }
        });

    }

    public writeXML(n: NodeGroup) {
        // Make output folder
        const dir = this.outputFolder + n.name + '/';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        const dest = dir + 'package.xml';
        let text = this.writeHeader();

        const typeMap = this.separateIntoGroups(n);
        Array.from(typeMap.entries()).forEach(pair => {
            text = text.concat((this.writeType(pair[0], pair[1]) as String).valueOf());
        });

        text = text.concat(this.writeFooter());

        fs.writeFile(dest, text, err => {
            // throws an error, you could also catch it here
            if (err) {
                throw err;
            }
        });

    }

    private separateIntoGroups(n: NodeGroup): Map<String, String[]> {
        const nodes = n.nodes;
        return this.separateIntoGroupsFromNodes(Array.from(nodes));
    }

    // precondition: All nodes are Scalar Nodes
    private separateIntoGroupsFromNodes(nodes: Node[]): Map<String, String[]> {
        const output: Map<String, String[]>  = new Map<String, String[]>();
        nodes.forEach(node => {
            const type = ((node.details.get('type')) as String).valueOf();
            let list = output.get(type);
            if (!list) {
                list = new Array<String>();
                list.push(node.details.get('name') as String);
                output.set(type, list);
            } else {
                list.push(node.details.get('name') as String);
            }
        });
        return output;
    }

    private writeHeader(): string {
        let header = '';
        // Add XML version and encoding
        header = header.concat('<?xml version=\"1.0\" encoding=\"UTF-8\"?>');
        header = header.concat('\n');
        header = header.concat('<Package xmlns=\"http://soap.sforce.com/2006/04/metadata\">\n');
        return header;
    }

    private writeType(type: String, nodes: String[]): String {
        let typeBody = '\t<types>\n';
        let ending = '';
        if (type.startsWith('Custom')) {
            ending = '__c';
        }
        for (const n of nodes) {
            typeBody = typeBody.concat('\t\t<members>');
            typeBody = typeBody.concat((n as String).valueOf());
            typeBody = typeBody.concat(ending);
            typeBody = typeBody.concat('</members>');
            typeBody = typeBody.concat('\n');
        }
        typeBody = typeBody.concat('\t\t<name>');
        typeBody = typeBody.concat(((type as String).valueOf()));
        typeBody = typeBody.concat('</name>\n');
        typeBody = typeBody.concat('\t</types>\n');
        return typeBody;
    }

    private writeFooter(): string {
        let footer = '';
        // Set version to 34.0, may be a flag that can be added later
        footer = footer.concat('\t<version>43.0</version>');
        footer = footer.concat('\n');
        footer = footer.concat('</Package>');
        return footer;
    }
}