// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
import { ILabShell } from '@jupyterlab/application';
import { ICommandPalette, MainAreaWidget } from '@jupyterlab/apputils';
import { ILauncher, LauncherModel } from '@jupyterlab/launcher';
import { SWANLauncher } from './launcher';
import { launcherIcon } from '@jupyterlab/ui-components';
import { toArray } from '@lumino/algorithm';
import { cernboxIcon, swanProjectImportIcon } from './icons';
/**
 * The command IDs used by the launcher plugin.
 */
var CommandIDs;
(function (CommandIDs) {
    CommandIDs.create_launcher = 'launcher:create';
    CommandIDs.create_project = 'swan:create_project';
    CommandIDs.import_project = 'swan:import_project';
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
export { SWANLauncher };
export default ProjectLauncher;
/**
 * Activate the launcher.
 */
function activate(app, labShell, palette) {
    const { serviceManager, commands } = app;
    const model = new LauncherModel();
    var launcher = null;
    commands.addCommand(CommandIDs.create_launcher, {
        icon: cernboxIcon,
        label: 'Share',
        execute: (args) => {
            console.dir('CWD = ' + JSON.stringify(args));
            const cwd = args['cwd'] ? String(args['cwd']) : '';
            const id = `swan-launcher-${Private.id++}`;
            const callback = (item) => {
                labShell.add(item, 'main', { ref: id });
            };
            launcher = new SWANLauncher({ model, cwd, callback, commands });
            launcher.model = model;
            launcher.service_manager = serviceManager;
            launcher.title.icon = launcherIcon;
            launcher.title.label = 'SWAN Launcher';
            const main = new MainAreaWidget({ content: launcher });
            // If there are any other widgets open, remove the launcher close icon.
            main.title.closable = !!toArray(labShell.widgets('main')).length;
            main.id = id;
            labShell.add(main, 'main', { activate: args['activate'] });
            labShell.layoutModified.connect(() => {
                // If there is only a launcher open, remove the close icon.
                main.title.closable = toArray(labShell.widgets('main')).length > 1;
            }, main);
            if (palette) {
                palette.addItem({ command: CommandIDs.create_launcher, category: 'SWAN' });
            }
            return main;
        }
    });
    //  let command_cernbox:ILauncher.IItemOptions = {
    //    command:'launcher:create',
    //    category:'CERNBox'//,
    //kernelIconUrl:"swan:create-project"
    //  }
    //  model.add(command_cernbox)
    /*  commands.addCommand(CommandIDs.create_project, {
        icon:swanProjectIcon,
        label: 'New',
        execute: (args: JSONObject) => {
          //TODO!
        }
      })
      */
    commands.addCommand(CommandIDs.import_project, {
        icon: swanProjectImportIcon,
        label: 'Import',
        execute: (args) => {
            //TODO!
        }
    });
    /*  let command_create:ILauncher.IItemOptions = {
        command:'swan:create_project',
        category:'Project',
        rank:1
      }
    */
    let command_import = {
        command: 'swan:import_project',
        category: 'Project'
    };
    //model.add(command_create)
    model.add(command_import);
    if (palette) {
        palette.addItem({ command: CommandIDs.create_launcher, category: 'Launcher' });
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