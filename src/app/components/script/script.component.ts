import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import * as FileSaver from 'file-saver';
import { AgentConfiguration } from '../../models/agent';
import { Analytics, logEvent } from '@angular/fire/analytics';

@Component({
  selector: 'app-script',
  templateUrl: './script.component.html',
  styleUrl: './script.component.scss'
})
export class ScriptComponent implements OnInit {

  private analytics = inject(Analytics);
  agentConfiguration: AgentConfiguration | null;
  deployScript: string = '';
  http: HttpClient = inject(HttpClient);
  route: ActivatedRoute = inject(ActivatedRoute);

  ngOnInit() {
    this.route.queryParamMap.subscribe( queryParams => {
      this.agentConfiguration = this.urlParamsToJson(queryParams) as AgentConfiguration;
      logEvent(this.analytics, "/export/download", {...this.getAgentConfigurationDefinitions()})
      this.http.get('assets/setup.py', { responseType: 'text' })
        .subscribe(pythonScript => {
          this.deployScript = this.replacePlaceholders(pythonScript, this.agentConfiguration!);
          const fileName= this.agentConfiguration!.name?.replaceAll(" ", "_");
          let blob = new Blob([this.deployScript], { type: 'text/plain;charset=utf-8' });
          FileSaver.saveAs(blob, `${fileName}_setup.py`);
        });
    })
  }

  replacePlaceholders(script: string, agentConfiguration: AgentConfiguration): string {
    const replaceMap: any = {
      AGENT_NAME: agentConfiguration.name,
      AGENT_DESCRIPTION: agentConfiguration.description,
      AGENT_INDUSTRY_TYPE: agentConfiguration.industry,
      AGENT_ORCHESTRATION_FRAMEWORK: this.getQualifiedFrameworkName(agentConfiguration),
      AGENT_FOUNDATION_MODEL: agentConfiguration.model,
      DEPLOY_TO_AGENT_ENGINE: agentConfiguration.runTime == 'CloudRun/FastApi' ? "False" : "True"
    };
    for (const key in replaceMap) {
      script = script.replace(`{{${key}}}`, replaceMap[key]);
    }
    return script;
  }

  getQualifiedFrameworkName(agentConfiguration: AgentConfiguration): string {
    let modelName: string = agentConfiguration.framework;
    if (agentConfiguration.framework == 'langchain_agent') {
      modelName = agentConfiguration.runTime == 'CloudRun/FastApi' ? 'langchain_prebuilt_agent' : 'langchain_vertex_ai_agent_engine_agent'
    } else {
      if(agentConfiguration.framework == 'langgraph_agent') {
        modelName = agentConfiguration.runTime == 'CloudRun/FastApi' ? 'langgraph_prebuilt_agent' : 'langgraph_vertex_ai_agent_engine_agent'
      }
    }

    return modelName;
  }

  urlParamsToJson(params: ParamMap): Record<string, any> {
    const jsonObject: Record<string, any> = {};
  
    for (const key of params.keys) {
      const values = params.getAll(key);
      if (values.length === 1) {
        try {
          // Try parsing as JSON (for nested objects/arrays that might have been stringified)
          jsonObject[key] = JSON.parse(values[0]);
        } catch (e) {
          // If parsing fails, treat it as a simple string value
          jsonObject[key] = values[0];
        }
      } else if (values.length > 1) {
        // If there are multiple values for the same key, treat it as an array
        const parsedValues = values.map(value => {
          try {
            return JSON.parse(value);
          } catch (e) {
            return value;
          }
        });
        jsonObject[key] = parsedValues;
      }
    }
  
    return jsonObject;
  }

  getAgentConfigurationDefinitions() {
    return {
      runtime: this.agentConfiguration!.runTime.toLowerCase().replaceAll(" ", "_"),
      orchestration_framework: this.agentConfiguration!.framework.toLowerCase(),
      industry: this.agentConfiguration!.industry.toLowerCase(),
      model: this.agentConfiguration!.model.toLowerCase().replaceAll(" ", "_").replaceAll("_(model_garden)", ""),
    }
  }
}