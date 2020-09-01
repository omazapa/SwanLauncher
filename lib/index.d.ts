import { VDomRenderer } from '@jupyterlab/apputils';
import { LabIcon } from '@jupyterlab/ui-components';
import * as React from 'react';
import { ILauncher, LauncherModel } from '@jupyterlab/launcher';
export declare const swanProjectIcon: LabIcon;
export declare const swanReadmeIcon: LabIcon;
export declare const swanConfigIcon: LabIcon;
/**
 * A virtual-DOM-based widget for the Launcher.
 */
export declare class SWANLauncher extends VDomRenderer<LauncherModel> {
    /**
     * Construct a new launcher widget.
     */
    constructor(options: ILauncher.IOptions);
    /**
     * The cwd of the launcher.
     */
    get cwd(): string;
    set cwd(value: string);
    /**
     * Whether there is a pending item being launched.
     */
    get pending(): boolean;
    set pending(value: boolean);
    /**
     * Launch dialog to change the stack of the project.
     */
    protected changeStack(): void;
    /**
     * Render the launcher to virtual DOM nodes.
     */
    protected render(): React.ReactElement<any> | null;
    private _commands;
    private _callback;
    private _pending;
    private _cwd;
}
