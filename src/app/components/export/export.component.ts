import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AgentConfigurationService } from '../../services/agent-configuration.service';
import { Analytics, logEvent } from '@angular/fire/analytics';
import { AgentConfiguration } from '../../models/agent';

@Component({
  selector: 'app-export',
  templateUrl: './export.component.html',
  styleUrl: './export.component.scss'
})
export class ExportComponent implements OnInit {
  private analytics = inject(Analytics);
  private agetConfigurationService: AgentConfigurationService = inject(AgentConfigurationService);
  private agentConfiguration: AgentConfiguration;
  private router: Router = inject(Router);
  
  downloadUrl = "";
  
  ngOnInit() {
    this.agentConfiguration = this.agetConfigurationService.get();
    logEvent(this.analytics, "/export", {...this.getAgentConfigurationDefinitions()})
    
    // this.downloadUrl = `https://agent-smithy-kiosk.web.app//script?${this.jsonToUrlParams(this.agentConfiguration)}`;
    this.downloadUrl = "https://github.com/google/adk-samples"
  }

  startAgain() {
    logEvent(this.analytics, "/return_to_home", {page: "export"});
    this.agetConfigurationService.remove();
    localStorage.removeItem("agentData");
    this.router.navigate(["/"])
  }

  jsonToUrlParams(jsonObject: Record<string, any>): string {
    const params = new URLSearchParams();
    for (const key in jsonObject) {
      if (jsonObject.hasOwnProperty(key)) {
        const value = jsonObject[key];
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(item => params.append(key, String(item)));
          } else if (typeof value === 'object') {
            params.append(key, JSON.stringify(value));
          } else {
            params.append(key, String(value));
          }
        }
      }
    }
    return params.toString();
  }

  getAgentConfigurationDefinitions() {
    return {
      runtime: this.agentConfiguration.runTime.toLowerCase().replaceAll(" ", "_"),
      orchestration_framework: this.agentConfiguration.framework.toLowerCase(),
      industry: this.agentConfiguration.industry.toLowerCase(),
      model: this.agentConfiguration.model.toLowerCase().replaceAll(" ", "_").replaceAll("_(model_garden)", ""),
    }
  }
}
