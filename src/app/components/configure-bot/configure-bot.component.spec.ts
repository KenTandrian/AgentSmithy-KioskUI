import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigureBotComponent } from './configure-bot.component';

describe('ConfigureBotComponent', () => {
  let component: ConfigureBotComponent;
  let fixture: ComponentFixture<ConfigureBotComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ConfigureBotComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfigureBotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
