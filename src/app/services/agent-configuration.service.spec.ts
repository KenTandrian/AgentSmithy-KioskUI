import { TestBed } from '@angular/core/testing';

import { AgentConfigurationService } from './agent-configuration.service';

describe('AgentConfigurationService', () => {
  let service: AgentConfigurationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AgentConfigurationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
