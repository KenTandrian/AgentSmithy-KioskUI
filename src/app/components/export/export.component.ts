import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AgentConfigurationService } from '../../services/agent-configuration.service';

@Component({
  selector: 'app-export',
  templateUrl: './export.component.html',
  styleUrl: './export.component.scss'
})
export class ExportComponent implements OnInit {
  downloadUrl = "";
  agetConfigurationService: AgentConfigurationService = inject(AgentConfigurationService);
  router: Router = inject(Router);

  ngOnInit() {
    const agentConfiguration = this.agetConfigurationService.get();
    this.downloadUrl = `http://localhost:4200/script?${this.jsonToUrlParams(agentConfiguration)}`;
  }

  startAgain() {
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
}
