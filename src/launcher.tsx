// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import {
  showErrorMessage,
  VDomRenderer
} from '@jupyterlab/apputils';

import { classes, LabIcon } from '@jupyterlab/ui-components';

import {
  map,
  each,
  toArray
} from '@lumino/algorithm';

import { CommandRegistry } from '@lumino/commands';

import { AttachedProperty } from '@lumino/properties';

import { Widget } from '@lumino/widgets';

import * as React from 'react';

import { ILauncher, LauncherModel } from '@jupyterlab/launcher';


import {ProjectHeader, ProjectReadme} from './components'

import {swanProjectsIcon} from './icons'

/**
 * The class name added to Launcher instances.
 */
const LAUNCHER_CLASS = 'jp-Launcher';

/**
 * The known categories of launcher items and their default ordering.
 */
var KNOWN_CATEGORIES = ['Other'];

/**
 * These launcher item categories are known to have kernels, so the kernel icons
 * are used.
 */
var KERNEL_CATEGORIES = ['Notebook'];


/**
 * A virtual-DOM-based widget for the Launcher.
 */
export class SWANLauncher extends VDomRenderer<LauncherModel> {
  /**
   * Construct a new launcher widget.
   */
  constructor(options: ILauncher.IOptions) {
    super(options.model);
    this._cwd = options.cwd;
    this._callback = options.callback;
    this._commands = options.commands;
    this.addClass(LAUNCHER_CLASS);
    this.checkPath(options.cwd)
  }

  /**
   * The cwd of the launcher.
   */
  get cwd(): string {
    return this._cwd;
  }
  protected onAfterShow():any{
    this._commands.execute('filebrowser:go-to-path',{
      path:this._cwd,
      showBrowser:true
    })
  }
  set cwd(value: string) {
    if(this.isVisible)
    {
      this._cwd = value;
      this.checkPath(value)
      this.update();
    }
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
  
  /**
   * Launch dialog to change the stack of the project.
   */
  protected changeStack(): void {
    console.log('call dialogs and API procedures TODO!')
  }

  protected checkPath(cwd:string):void {
    if(cwd=="project")
    {
    this.is_project=true;
    this.readme = "# Some markDown \n * added readme support here from request to our API";
    this.stack_name = "LCG97";
    this.project_name = "Project 1";
    }else{
      this.is_project=false;
      this.readme = "# Some markDown \n * added readme support here from request to our API";
      this.stack_name = "LCG97";
      this.project_name = "Project 1";  
    }
  }

  /**
   * Render the launcher to virtual DOM nodes.
   */
  protected render(): React.ReactElement<any> | null {
    
    console.log('render path changed = '+this._cwd)

    // Bail if there is no model.
    if (!this.model) {
      return null;
    }

    if(this.is_project)
    {
      KNOWN_CATEGORIES=['Notebook','Console','Other']
      KERNEL_CATEGORIES=['Notebook','Console']

    }else{
      KNOWN_CATEGORIES=['Project']
    }
    // First group-by categories
    const categories = Object.create(null);
    each(this.model.items(), (item, index) => {
      const cat = item.category || 'Other';
      if (!(cat in categories)) {
        categories[cat] = [];
      }
      if(this.is_project)
      {
          categories[cat].push(item);
      }else{
        if(cat!="Notebook")
          categories[cat].push(item);
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
      if(this.is_project)
      {
        if(cat=='Project' || cat=='Projects')
        return
      }
      else
      {
        if(cat=='Notebook' || cat=='Console' || cat=='CERNBox')
        return
      }
      const item = categories[cat][0] as ILauncher.IItemOptions;
      const args = { ...item.args, cwd: this.cwd };
      const kernel = KERNEL_CATEGORIES.indexOf(cat) > -1;

      // DEPRECATED: remove _icon when lumino 2.0 is adopted
      // if icon is aliasing iconClass, don't use it
      const iconClass = this._commands.iconClass(item.command, args);
      const _icon = this._commands.icon(item.command, args);
      let icon = _icon === iconClass ? undefined : _icon;

      if (cat in categories) {
        if(cat =='Projects')//special icon for projects not associated to the launcher icon
        {
          icon=swanProjectsIcon
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
    //let readme = "# Some markDown \n * added readme support here from request to our API";
    //let stackname = "LCG97";
    //let project_name = "Project 1";

    // Wrap the sections in body and content divs.
    return (
      <div className="jp-Launcher-body">
        <div className="jp-Launcher-content">
          <ProjectHeader is_project={this.is_project} project_name={this.project_name} stack_name={this.stack_name}/>
          <div className="jp-Launcher-cwd">
            <h3>I am at {this.cwd}</h3>
          </div>
          {sections}
          <ProjectReadme is_project={this.is_project} readme={this.readme}/>
      </div>
      </div >
    );
  }

  private _commands: CommandRegistry;
  private _callback: (widget: Widget) => void;
  private _pending = false;
  private _cwd = '';

  private is_project:boolean;
  private project_name:string;
  private stack_name:string;
  private readme:string;

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
