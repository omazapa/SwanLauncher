import { LabIcon } from '@jupyterlab/ui-components';
import {swanProjectIcon,swanConfigIcon, swanReadmeIcon} from './icons'

import * as React from 'react';

import ReactMarkdown from 'react-markdown'

export type SWANProjectIOptions = {
    is_project:boolean;
    project_name?:string;
    stack_name?:string;
    readme?:string;
  }

export function ProjectHeader(props:SWANProjectIOptions) {
    function changeStack(){
      console.log('not implemented yet!')
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
          <h2 className="jp-Launcher-sectionTitle">{props.project_name}</h2>
        </td>
        <td style={{ textAlign: "right" }}>
          <b>{props.stack_name}</b>
        </td>
        <td style={{ textAlign: "right", width: "48px", height:"48px"}}>
          <div className="jp-LauncherCard" id="swan_config_button" style={{ width: "48px",height:"48px" }} onClick={changeStack} tabIndex={100}>
            <div className="jp-LauncherCard-icon" style={{  width: "48px",height:"48px" }}>
              {
                <LabIcon.resolveReact
                  icon={swanConfigIcon}
                  width="32px"
                  height="32px"
                  textAlign="center"
                />
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
    if(props.is_project)
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
      <ReactMarkdown source={props.readme}></ReactMarkdown>
    </div>
      );
    }else
    {
      return (<div/>)
    }
  }

