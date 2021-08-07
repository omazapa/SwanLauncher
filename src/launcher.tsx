// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import { showErrorMessage, VDomRenderer , Dialog} from '@jupyterlab/apputils';

import { classes, LabIcon } from '@jupyterlab/ui-components';

import { map, each, toArray } from '@lumino/algorithm';

import { CommandRegistry } from '@lumino/commands';

import { AttachedProperty } from '@lumino/properties';

import { Widget } from '@lumino/widgets';

import * as React from 'react';

import { ILauncher, LauncherModel } from '@jupyterlab/launcher';

import { ProjectHeader, ProjectReadme } from './components';

import { swanProjectsIcon } from './icons';

import { request } from './request';

import { ServiceManager } from '@jupyterlab/services';

import { Spinner } from '@jupyterlab/apputils';
import { JSONObject } from '@lumino/coreutils';

/**
 * The class name added to Launcher instances.
 */
const LAUNCHER_CLASS = 'jp-Launcher';

/**
 * The known categories of launcher items and their default ordering.
 */
let KNOWN_CATEGORIES = [];

/**
 * These launcher item categories are known to have kernels, so the kernel icons
 * are used.
 */
const KERNEL_CATEGORIES = ['Notebook', 'Console'];

/**
 * SWAN Project options from .swanproject file plus readme 
 * this is required to validated that the project file is not corrupted,
 * two special cases are the readme and name that is not part of the the .swanproject file, 
 * but it is sent in the request.
 */
  export interface ISWANProjectOptions{
  name?: string;
  stack?: string;
  release?: string;
  platform?: string;
  user_script?: string;
  readme?: string | null | undefined;
  python2?: any;
  python3?: any;
  kernel_dirs?: string[];
}


/**
 * A virtual-DOM-based widget for the Launcher.
 */
export class SWANLauncher extends VDomRenderer<LauncherModel> {
  /**
   * Construct a new launcher widget.
   */
  constructor(options: ILauncher.IOptions) {
    super(options.model);
    this.model = options.model;
    this._cwd = options.cwd;
    this._callback = options.callback;
    this._commands = options.commands;
    this.addClass(LAUNCHER_CLASS);
    this._spinner = new Spinner();

    this.checkPath(options.cwd).then(rvalue => {
      this.update();
    });
  }

  protected startSpinner(): void {
    //const node = document.getElementById('jp-main-dock-panel');
    const node = this.node;
    node?.appendChild(this._spinner.node);
    node?.focus();
    this._spinner.activate();
    this._spinner.show();
    this._spinner.node.focus();
  }

  protected stopSpinner(): void {
    this._spinner.hide();
  }

  protected contentRequest(cwd: string): any {
    try {
      return request<any>('api/contents/' + cwd, {
        method: 'GET'
      }).then(rvalue => {
        return rvalue;
      });
    } catch (reason) {
      console.error(`Error on GET 'api/contents'+ ${cwd}.\n${reason}`);
    }
  }

  protected projectInfoRequest(project: string): any {
    const dataToSend = { path: project };
    try {
      return request<any>('swan/project/info', {
        body: JSON.stringify(dataToSend),
        method: 'POST'
      }).then(rvalue => {
        this.update();
        return rvalue;
      });
    } catch (reason) {
      console.error(
        `Error on POST 'swan/project/info'+ ${dataToSend}.\n${reason}`
      );
    }
  }
  /**
   * The cwd of the launcher.
   */
  get cwd(): string {
    return this._cwd;
  }

  set cwd(value: string) {
    if (this.isVisible) {
      this._cwd = value;
      this.checkPath(value);
    }
  }

  protected async onAfterShow(): Promise<any> {
    await this._commands
      .execute('filebrowser:go-to-path', {
        path: this._cwd,
        showBrowser: true
      })
      .then(async () => {
        await this.service_manager?.kernelspecs.refreshSpecs();
        this.update();
      });
  }

  /**
   * Whether there is a pending item being launched.
   */
  get pending(): boolean {
    return this._pending;
  }

  set pending(value: boolean) {
    this._pending = value;
  }

  protected isValidProject(project_data:JSONObject):boolean {    
    for(const tag in this.project_tags)
    {
      if (!(this.project_tags[tag] in project_data)) {
        console.log(this.project_tags[tag])
        return false;
      }
    }
    return true; 
  }
  protected getProjectMissingTags(project_data:JSONObject):string[] {
    let missing_tags:string[] = []
    for(const tag in this.project_tags)
    {
      if (!(tag in project_data))
      { 
        missing_tags.push(tag)
      }
    }
    return missing_tags;
  }

  async checkPath(cwd: string): Promise<void> {
    this.startSpinner();
    const info = await this.contentRequest(cwd);

    this.is_project = info.is_project;
    const project_info = await this.projectInfoRequest(info.path);
    // console.log(project_info);
    if (this.is_project) {
      const project_data = project_info['project_data'] as ISWANProjectOptions;
      if(this.isValidProject(project_data as JSONObject))
      {
        this.project_options = project_data;
        console.log(this.project_options);
        await this.service_manager?.kernelspecs.refreshSpecs();  
      }else{
        this.project_options = project_data;
        let missing_tags = this.getProjectMissingTags(project_data as JSONObject);
        var available_tags = this.project_tags.filter((item) => !missing_tags.includes(item));
        showErrorMessage("Project Error:",
        "The configuration file of the project (.swanproject) is currupted, missing fields are:"+available_tags+". \nThe project can not be opened, do you want to open a Dialog to edit it?",
        [Dialog.cancelButton(),
          Dialog.okButton()])
      }
    }
    this.stopSpinner();
    this.update();
  }

  /**
   * Render the launcher to virtual DOM nodes.
   */
  protected render(): React.ReactElement<any> | null {
    // Bail if there is no model.
    if (!this.model) {
      return null;
    }
    if (this.is_project) {
      KNOWN_CATEGORIES = ['Notebook', 'Console', 'Other'];
    } else {
      KNOWN_CATEGORIES = ['Project'];
    }
    // First group-by categories
    const categories = Object.create(null);
    each(this.model.items(), (item, index) => {
      const cat = item.category || 'Other';
      //const args = item.args;

      if (!(cat in categories)) {
        categories[cat] = [];
      }
      if (this.is_project) {
        if (cat === 'Notebook' || cat === 'Console') {
          categories[cat].push(item);
        } else {
          categories[cat].push(item);
        }
      } else {
        if (cat !== 'Notebook') {
          categories[cat].push(item);
        }
      }
    });
    // Within each category sort by rank
    for (const cat in categories) {
      categories[cat] = categories[cat].sort(
        (a: ILauncher.IItemOptions, b: ILauncher.IItemOptions) => {
          return Private.sortCmp(a, b, this._cwd, this._commands);
        }
      );
    }

    // Variable to help create sections
    const sections: React.ReactElement<any>[] = [];
    let section: React.ReactElement<any>;

    // Assemble the final ordered list of categories, beginning with
    // KNOWN_CATEGORIES.
    const orderedCategories: string[] = [];
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
      if (this.is_project) {
        if (cat === 'Project' || cat === 'Projects') {
          return;
        }
      } else {
        if (cat === 'Notebook' || cat === 'Console' || cat === 'CERNBox') {
          return;
        }
      }

      let item = null;
      if (categories[cat]) {
        item = categories[cat][0] as ILauncher.IItemOptions;
      }
      if (item === null) {
        return;
      }
      if (this.is_project && item.command === 'terminal:create-new') {
        item.args = {
          initialCommand: 'swan_bash ' + this.project_options.name + '; exit 0'
        };
      } else if (item.command === 'terminal:create-new') {
        item.args = { initialCommand: '' };
      }
      const args = { ...item.args, cwd: this.cwd };
      const kernel = KERNEL_CATEGORIES.indexOf(cat) > -1;

      // DEPRECATED: remove _icon when lumino 2.0 is adopted
      // if icon is aliasing iconClass, don't use it

      const iconClass = this._commands.iconClass(item.command, args);
      const _icon = this._commands.icon(item.command, args);
      let icon = _icon === iconClass ? undefined : _icon;

      if (cat in categories) {
        if (cat === 'Projects') {
          //special icon for projects not associated to the launcher icon
          icon = swanProjectsIcon;
        }
        section = (
          <div className="jp-Launcher-section" key={cat}>
            <div className="jp-Launcher-sectionHeader">
              <LabIcon.resolveReact
                icon={icon}
                iconClass={classes(iconClass, 'jp-Icon-cover')}
                stylesheet="launcherSection"
              />
              <h2 className="jp-Launcher-sectionTitle">{cat}</h2>
            </div>
            <div className="jp-Launcher-cardContainer">
              {toArray(
                map(categories[cat], (item: ILauncher.IItemOptions) => {
                  return Card(
                    kernel,
                    item,
                    this,
                    this._commands,
                    this._callback
                  );
                })
              )}
            </div>
          </div>
        );
        sections.push(section);
      }
    });

    // Wrap the sections in body and content divs.
    return (
      <div className="jp-Launcher-body">
        <div className="jp-Launcher-content">
          <ProjectHeader
            is_project={this.is_project}
            name={this.project_options.name}
            stack={this.project_options.stack}
            release={this.project_options.release}
            platform={this.project_options.platform}
            user_script={this.project_options.user_script}
            commands={this._commands}
            launcher={this}
          />
          <div className="jp-Launcher-cwd"></div>
          {sections}
          <ProjectReadme is_project={this.is_project} readme={this.project_options.readme} />
        </div>
      </div>
    );
  }

  private _commands: CommandRegistry;
  private _callback: (widget: Widget) => void;
  private _pending = false;
  private _cwd = '';
  private _spinner: Spinner;

  private is_project = false;
  private project_options: ISWANProjectOptions = {name:'',stack:'',release:'',platform:'',user_script:'',readme:''};
  //tags to be validated, readme and user_script are not needed, they are optional files.
  private project_tags:string[] = ['name','stack','release','platform','python2','python3','kernel_dirs'] 
  public service_manager: ServiceManager | null = null;
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
function Card(
  kernel: boolean,
  item: ILauncher.IItemOptions,
  launcher: SWANLauncher,
  commands: CommandRegistry,
  launcherCallback: (widget: Widget) => void
): React.ReactElement<any> {
  // Get some properties of the command
  const command = item.command;
  const args = { ...item.args, cwd: launcher.cwd };
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
      .execute(command, {
        ...item.args,
        cwd: launcher.cwd
      })
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
  const onkeypress = (event: React.KeyboardEvent) => {
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
  return (
    <div
      className="jp-LauncherCard"
      title={title}
      onClick={onclick}
      onKeyPress={onkeypress}
      tabIndex={100}
      data-category={item.category || 'Other'}
      key={Private.keyProperty.get(item)}
    >
      <div className="jp-LauncherCard-icon">
        {kernel ? (
          item.kernelIconUrl ? (
            <img src={item.kernelIconUrl} className="jp-Launcher-kernelIcon" />
          ) : (
            <div className="jp-LauncherCard-noKernelIcon">
              {label[0].toUpperCase()}
            </div>
          )
        ) : (
          <LabIcon.resolveReact
            icon={icon}
            iconClass={classes(iconClass, 'jp-Icon-cover')}
            stylesheet="launcherCard"
          />
        )}
      </div>
      <div className="jp-LauncherCard-label" title={title}>
        <p>{label}</p>
      </div>
    </div>
  );
}

/**
 * The namespace for module private data.
 */
namespace Private {
  /**
   * An incrementing counter for keys.
   */
  let id = 0;

  /**
   * An attached property for an item's key.
   */
  export const keyProperty = new AttachedProperty<
    ILauncher.IItemOptions,
    number
  >({
    name: 'key',
    create: () => id++
  });

  /**
   * Create a fully specified item given item options.
   */
  export function createItem(
    options: ILauncher.IItemOptions
  ): ILauncher.IItemOptions {
    return {
      ...options,
      category: options.category || '',
      rank: options.rank !== undefined ? options.rank : Infinity
    };
  }

  /**
   * A sort comparison function for a launcher item.
   */
  export function sortCmp(
    a: ILauncher.IItemOptions,
    b: ILauncher.IItemOptions,
    cwd: string,
    commands: CommandRegistry
  ): number {
    // First, compare by rank.
    const r1 = a.rank;
    const r2 = b.rank;
    if (r1 !== r2 && r1 !== undefined && r2 !== undefined) {
      return r1 < r2 ? -1 : 1; // Infinity safe
    }

    // Finally, compare by display name.
    const aLabel = commands.label(a.command, { ...a.args, cwd });
    const bLabel = commands.label(b.command, { ...b.args, cwd });
    return aLabel.localeCompare(bLabel);
  }
}
