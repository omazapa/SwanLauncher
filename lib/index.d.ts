import { JupyterFrontEndPlugin } from '@jupyterlab/application';
import { ILauncher } from '@jupyterlab/launcher';
import { LabIcon } from '@jupyterlab/ui-components';
export declare const swanProjectIcon: LabIcon;
/**
 * A service providing an interface to the the launcher.
 */
declare const ProjectLauncher: JupyterFrontEndPlugin<ILauncher>;
/**
 * Export the plugin as default.
 */
export default ProjectLauncher;
