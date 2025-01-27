import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PredefinedBotComponent } from './predefined-bot.component';

describe('PredefinedBotComponent', () => {
  let component: PredefinedBotComponent;
  let fixture: ComponentFixture<PredefinedBotComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PredefinedBotComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PredefinedBotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
