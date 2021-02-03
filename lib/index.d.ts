import { JupyterFrontEndPlugin } from '@jupyterlab/application';
import { ILauncher } from '@jupyterlab/launcher';
import { SWANLauncher } from './launcher';
/**
 * A service providing an interface to the the launcher.
 */
declare const ProjectLauncher: JupyterFrontEndPlugin<ILauncher>;
/**
 * Export the plugin as default.
 */
export { SWANLauncher };
export default ProjectLauncher;
