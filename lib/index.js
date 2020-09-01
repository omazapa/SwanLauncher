// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
import { showErrorMessage, VDomRenderer } from '@jupyterlab/apputils';
import { classes, LabIcon } from '@jupyterlab/ui-components';
import { map, each, toArray } from '@lumino/algorithm';
import { AttachedProperty } from '@lumino/properties';
import { Widget } from '@lumino/widgets';
import * as React from 'react';
import ReactMarkdown from 'react-markdown';
import swanProjectIconStr from "../style/project.svg";
import swanReadmeIconStr from "../style/list-alt.svg";
import swanConfigIconStr from "../style/cog.svg";
export const swanProjectIcon = new LabIcon({
    name: "jupyterlab_swan:project",
    svgstr: swanProjectIconStr
});
export const swanReadmeIcon = new LabIcon({
    name: "jupyterlab_swan:reame",
    svgstr: swanReadmeIconStr
});
export const swanConfigIcon = new LabIcon({
    name: "jupyterlab_swan:config",
    svgstr: swanConfigIconStr
});
/**
 * The class name added to Launcher instances.
 */
const LAUNCHER_CLASS = 'jp-Launcher';
/**
 * The known categories of launcher items and their default ordering.
 */
const KNOWN_CATEGORIES = ['Notebook'];
/**
 * These launcher item categories are known to have kernels, so the kernel icons
 * are used.
 */
const KERNEL_CATEGORIES = ['Notebook'];
/**
 * A virtual-DOM-based widget for the Launcher.
 */
export class SWANLauncher extends VDomRenderer {
    /**
     * Construct a new launcher widget.
     */
    constructor(options) {
        super(options.model);
        this._pending = false;
        this._cwd = '';
        this._cwd = options.cwd;
        this._callback = options.callback;
        this._commands = options.commands;
        this.addClass(LAUNCHER_CLASS);
    }
    /**
     * The cwd of the launcher.
     */
    get cwd() {
        return this._cwd;
    }
    set cwd(value) {
        this._cwd = value;
        this.update();
    }
    /**
     * Whether there is a pending item being launched.
     */
    get pending() {
        return this._pending;
    }
    set pending(value) {
        this._pending = value;
    }
    /**
     * Launch dialog to change the stack of the project.
     */
    changeStack() {
        console.log('call dialogs and API procedures TODO!');
    }
    /**
     * Render the launcher to virtual DOM nodes.
     */
    render() {
        // Bail if there is no model.
        if (!this.model) {
            return null;
        }
        // First group-by categories
        const categories = Object.create(null);
        each(this.model.items(), (item, index) => {
            const cat = item.category || 'Other';
            if (!(cat in categories)) {
                categories[cat] = [];
            }
            categories[cat].push(item);
        });
        // Within each category sort by rank
        for (const cat in categories) {
            categories[cat] = categories[cat].sort((a, b) => {
                return Private.sortCmp(a, b, this._cwd, this._commands);
            });
        }
        // Variable to help create sections
        const sections = [];
        let section;
        // Assemble the final ordered list of categories, beginning with
        // KNOWN_CATEGORIES.
        const orderedCategories = [];
        each(KNOWN_CATEGORIES, (cat, index) => {
            orderedCategories.push(cat);
        });
        for (const cat in categories) {
            if (KNOWN_CATEGORIES.indexOf(cat) === -1) {
                orderedCategories.push(cat);
            }
        }
        // Now create the sections for each category
        orderedCategories.forEach(cat => {
            const item = categories[cat][0];
            const args = Object.assign(Object.assign({}, item.args), { cwd: this.cwd });
            const kernel = KERNEL_CATEGORIES.indexOf(cat) > -1;
            // DEPRECATED: remove _icon when lumino 2.0 is adopted
            // if icon is aliasing iconClass, don't use it
            const iconClass = this._commands.iconClass(item.command, args);
            const _icon = this._commands.icon(item.command, args);
            const icon = _icon === iconClass ? undefined : _icon;
            if (cat in categories) {
                section = (React.createElement("div", { className: "jp-Launcher-section", key: cat },
                    React.createElement("div", { className: "jp-Launcher-sectionHeader" },
                        React.createElement(LabIcon.resolveReact, { icon: icon, iconClass: classes(iconClass, 'jp-Icon-cover'), stylesheet: "launcherSection" }),
                        React.createElement("h2", { className: "jp-Launcher-sectionTitle" }, cat)),
                    React.createElement("div", { className: "jp-Launcher-cardContainer" }, toArray(map(categories[cat], (item) => {
                        return Card(kernel, item, this, this._commands, this._callback);
                    })))));
                sections.push(section);
            }
        });
        let readme = "# Some markDown \n * added readme support here from request to our API";
        let stackname = "LCG97";
        let project_name = "Project 1";
        // Wrap the sections in body and content divs.
        return (React.createElement("div", { className: "jp-Launcher-body" },
            React.createElement("div", { className: "jp-Launcher-content" },
                React.createElement("table", { style: { width: "100%", height: "64px" } },
                    React.createElement("tbody", null,
                        React.createElement("tr", null,
                            React.createElement("td", { style: { width: "48px" } },
                                React.createElement(LabIcon.resolveReact, { icon: swanProjectIcon, stylesheet: "launcherSection" })),
                            React.createElement("td", { style: { textAlign: "left" } },
                                React.createElement("h2", { className: "jp-Launcher-sectionTitle" }, project_name)),
                            React.createElement("td", { style: { textAlign: "right" } },
                                React.createElement("b", null, stackname)),
                            React.createElement("td", { style: { textAlign: "right", width: "64px" } },
                                React.createElement("div", { className: "jp-LauncherCard", id: "swan_config_button", onClick: this.changeStack, tabIndex: 100 },
                                    React.createElement("div", { className: "jp-LauncherCard-icon" }, React.createElement(LabIcon.resolveReact, { icon: swanConfigIcon }))))))),
                React.createElement("div", { className: "jp-Launcher-cwd" },
                    React.createElement("h3", null, this.cwd)),
                sections,
                React.createElement("div", { className: "jp-Launcher-section", key: 'Readme' },
                    React.createElement("div", { className: "jp-Launcher-sectionHeader" },
                        React.createElement(LabIcon.resolveReact, { icon: swanReadmeIcon, stylesheet: "launcherSection" }),
                        React.createElement("h2", { className: "jp-Launcher-sectionTitle" }, "Readme")),
                    React.createElement("div", { className: "jp-Launcher-cardContainer" }),
                    React.createElement(ReactMarkdown, { source: readme })))));
    }
}
/**
 * A pure tsx component for a launcher card.
 *
 * @param kernel - whether the item takes uses a kernel.
 *
 * @param item - the launcher item to render.
 *
 * @param launcher - the Launcher instance to which this is added.
 *
 * @param launcherCallback - a callback to call after an item has been launched.
 *
 * @returns a vdom `VirtualElement` for the launcher card.
 */
function Card(kernel, item, launcher, commands, launcherCallback) {
    // Get some properties of the command
    const command = item.command;
    const args = Object.assign(Object.assign({}, item.args), { cwd: launcher.cwd });
    const caption = commands.caption(command, args);
    const label = commands.label(command, args);
    const title = kernel ? label : caption || label;
    // Build the onclick handler.
    const onclick = () => {
        // If an item has already been launched,
        // don't try to launch another.
        if (launcher.pending === true) {
            return;
        }
        launcher.pending = true;
        void commands
            .execute(command, Object.assign(Object.assign({}, item.args), { cwd: launcher.cwd }))
            .then(value => {
            launcher.pending = false;
            if (value instanceof Widget) {
                launcherCallback(value);
                launcher.dispose();
            }
        })
            .catch(err => {
            launcher.pending = false;
            void showErrorMessage('Launcher Error', err);
        });
    };
    // With tabindex working, you can now pick a kernel by tabbing around and
    // pressing Enter.
    const onkeypress = (event) => {
        if (event.key === 'Enter') {
            onclick();
        }
    };
    // DEPRECATED: remove _icon when lumino 2.0 is adopted
    // if icon is aliasing iconClass, don't use it
    const iconClass = commands.iconClass(command, args);
    const _icon = commands.icon(command, args);
    const icon = _icon === iconClass ? undefined : _icon;
    // Return the VDOM element.
    return (React.createElement("div", { className: "jp-LauncherCard", title: title, onClick: onclick, onKeyPress: onkeypress, tabIndex: 100, "data-category": item.category || 'Other', key: Private.keyProperty.get(item) },
        React.createElement("div", { className: "jp-LauncherCard-icon" }, kernel ? (item.kernelIconUrl ? (React.createElement("img", { src: item.kernelIconUrl, className: "jp-Launcher-kernelIcon" })) : (React.createElement("div", { className: "jp-LauncherCard-noKernelIcon" }, label[0].toUpperCase()))) : (React.createElement(LabIcon.resolveReact, { icon: icon, iconClass: classes(iconClass, 'jp-Icon-cover'), stylesheet: "launcherCard" }))),
        React.createElement("div", { className: "jp-LauncherCard-label", title: title },
            React.createElement("p", null, label))));
}
/**
 * The namespace for module private data.
 */
var Private;
(function (Private) {
    /**
     * An incrementing counter for keys.
     */
    let id = 0;
    /**
     * An attached property for an item's key.
     */
    Private.keyProperty = new AttachedProperty({
        name: 'key',
        create: () => id++
    });
    /**
     * Create a fully specified item given item options.
     */
    function createItem(options) {
        return Object.assign(Object.assign({}, options), { category: options.category || '', rank: options.rank !== undefined ? options.rank : Infinity });
    }
    Private.createItem = createItem;
    /**
     * A sort comparison function for a launcher item.
     */
    function sortCmp(a, b, cwd, commands) {
        // First, compare by rank.
        const r1 = a.rank;
        const r2 = b.rank;
        if (r1 !== r2 && r1 !== undefined && r2 !== undefined) {
            return r1 < r2 ? -1 : 1; // Infinity safe
        }
        // Finally, compare by display name.
        const aLabel = commands.label(a.command, Object.assign(Object.assign({}, a.args), { cwd }));
        const bLabel = commands.label(b.command, Object.assign(Object.assign({}, b.args), { cwd }));
        return aLabel.localeCompare(bLabel);
    }
    Private.sortCmp = sortCmp;
})(Private || (Private = {}));
//# sourceMappingURL=index.js.map