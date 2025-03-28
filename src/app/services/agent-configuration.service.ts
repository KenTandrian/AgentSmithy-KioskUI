import { Injectable } from '@angular/core';
import { AgentConfiguration } from '../models/agent';

const AGENT_CONFIGURATION_KEY = "agent_configuration"

@Injectable({
  providedIn: 'root'
})
export class AgentConfigurationService {

  constructor() { }

  get(): AgentConfiguration {
    return JSON.parse(localStorage.getItem(AGENT_CONFIGURATION_KEY) || '{}');
  }

  save(agentConfiguration: AgentConfiguration) {
    localStorage.setItem(AGENT_CONFIGURATION_KEY, JSON.stringify(agentConfiguration));
  }

  remove() {
    localStorage.removeItem(AGENT_CONFIGURATION_KEY);
  }
}
