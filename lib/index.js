// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
import { ILabShell } from '@jupyterlab/application';
import { ICommandPalette, MainAreaWidget } from '@jupyterlab/apputils';
import { ILauncher, LauncherModel } from '@jupyterlab/launcher';
import { SWANLauncher } from './launcher';
import { launcherIcon } from '@jupyterlab/ui-components';
import { toArray } from '@lumino/algorithm';
import { LabIcon } from '@jupyterlab/ui-components';
import swanIconStr from "../style/cernbox.svg";
export const swanProjectIcon = new LabIcon({
    name: "jupyterlab_swan:project_icon",
    svgstr: swanIconStr
});
/**
 * The command IDs used by the launcher plugin.
 */
var CommandIDs;
(function (CommandIDs) {
    CommandIDs.create = 'launcher:create';
})(CommandIDs || (CommandIDs = {}));
/**
 * A service providing an interface to the the launcher.
 */
const ProjectLauncher = {
    activate,
    id: '@swan/launcher-project:plugin',
    requires: [ILabShell],
    optional: [ICommandPalette],
    provides: ILauncher,
    autoStart: true
};
/**
 * Export the plugin as default.
 */
export default ProjectLauncher;
/**
 * Activate the launcher.
 */
function activate(app, labShell, palette) {
    const { commands } = app;
    const model = new LauncherModel();
    commands.addCommand(CommandIDs.create, {
        icon: swanProjectIcon,
        label: 'Share',
        execute: (args) => {
            const cwd = args['cwd'] ? String(args['cwd']) : '';
            const id = `swan-launcher-${Private.id++}`;
            const callback = (item) => {
                labShell.add(item, 'main', { ref: id });
            };
            let readme = "# Some markDown \n * added readme support here from request to our API";
            let stackname = "LCG97";
            let project_name = "Project 1";
            const launcher = new SWANLauncher({ model, cwd, callback, commands }, { 'is_project': false, 'project_name': project_name, 'readme': readme, 'stack_name': stackname });
            launcher.model = model;
            launcher.title.icon = launcherIcon;
            launcher.title.label = 'SWAN Project Launcher';
            let command4 = {
                command: 'launcher:create',
                category: 'CERNBox' //,
                //kernelIconUrl:"swan:create-project"
            };
            model.add(command4);
            const main = new MainAreaWidget({ content: launcher });
            // If there are any other widgets open, remove the launcher close icon.
            main.title.closable = !!toArray(labShell.widgets('main')).length;
            main.id = id;
            labShell.add(main, 'main', { activate: args['activate'] });
            labShell.layoutModified.connect(() => {
                // If there is only a launcher open, remove the close icon.
                main.title.closable = toArray(labShell.widgets('main')).length > 1;
            }, main);
            return main;
        }
    });
    if (palette) {
        palette.addItem({ command: CommandIDs.create, category: 'Launcher' });
    }
    return model;
}
/**
 * The namespace for module private data.
 */
var Private;
(function (Private) {
    /**
     * The incrementing id used for launcher widgets.
     */
    Private.id = 0;
})(Private || (Private = {}));
//# sourceMappingURL=index.js.map