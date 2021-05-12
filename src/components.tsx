import { LabIcon } from '@jupyterlab/ui-components';
import {swanProjectIcon,swanConfigIcon, swanReadmeIcon} from './icons'

import * as React from 'react';

import ReactMarkdown from 'react-markdown'
import { CommandRegistry } from '@lumino/commands';
import {SWANLauncher} from './launcher';

export type SWANProjectIOptions = {
    is_project:boolean;
    name?:string;
    stack?:string;
    release?:string | "";
    platform?:string | "";
    user_script?:string | "";
    readme?:string | null;
    commands?: CommandRegistry;
    launcher?:SWANLauncher;
  }

  
export function ProjectHeader(props:SWANProjectIOptions) {
    function changeStack(){
       return props.commands?.execute('swan:edit-project-dialog',{
          name:props.name,
          stack:props.stack,
          release:props.release,
          platform:props.platform,
          user_script:props.user_script
        })
        
        //.then((args)=>{
          // console.log("updating path");
          // console.log(props.launcher?.cwd);
          // console.log(args);
          // this._commands.execute('filebrowser:go-to-path',{
          //   path:this._cwd,
          //   showBrowser:true
          // }).then(()=>{
          //   this.service_manager.kernelspecs.refreshSpecs();
          //   this.update();  
          //  })
          //props.launcher?.setPath(args["project_dir"])
    
          //console.log("updating kernels");
          //await props.launcher?.service_manager.kernelspecs.refreshSpecs();
          //props.launcher?.update();  
          // console.log("stopping spinner");
        // })

    }
    return (
      <table style={{ width: "100%", height: "64px", display :  (props.is_project ? '' : 'none')}}>
      <tbody>
      < tr >
        <td style={{ width: "48px" }}>
          <LabIcon.resolveReact
            icon={swanProjectIcon}
            stylesheet="launcherSection"
          />
        </td>
        <td style={{ textAlign: "left" }}>
          <h2 className="jp-Launcher-sectionTitle">{props.name}</h2>
        </td>
        <td style={{ textAlign: "right", color: "#808080"}}>
          {props.release} ({props.platform})
        </td>
        <td style={{ textAlign: "right", width: "24px", height:"24px", color: "#808080"}}>
          <div className="" id="swan_config_button" style={{ width: "26px",height:"26px", borderRadius: '85x'}} onClick={changeStack}>
            <div className="jp-LauncherCard-icon" style={{  width: "26px",height:"26px"}}>
              {
                <LabIcon.resolveReact
                  icon={swanConfigIcon}
                  width="20px"
                  height="20px"
                  display= "block"
                  margin-left = "auto"
                  margin-right = "auto"                />
              }
            </div>
          </div>
        </td>
      </tr>
      </tbody>
    </table>
  );
  }

  export function ProjectReadme(props:SWANProjectIOptions) {
    if(props.is_project && props.readme !== null)
    {
    return (
      <div className="jp-Launcher-section" key='Readme' style={{display :  (props.is_project ? '' : 'none')}}>
      <div className="jp-Launcher-sectionHeader">
        <LabIcon.resolveReact
          icon={swanReadmeIcon}
          stylesheet="launcherSection"
        />
        <h2 className="jp-Launcher-sectionTitle">Readme</h2>
      </div>
      <div className="jp-Launcher-cardContainer">
      </div>
      <ReactMarkdown>{props.readme as string}</ReactMarkdown>
    </div>
      );
    }else
    {
      return (<div/>)
    }
  }

