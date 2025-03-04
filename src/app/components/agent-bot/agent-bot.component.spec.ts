import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgentBotComponent } from './agent-bot.component';

describe('AgentBotComponent', () => {
  let component: AgentBotComponent;
  let fixture: ComponentFixture<AgentBotComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AgentBotComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AgentBotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
