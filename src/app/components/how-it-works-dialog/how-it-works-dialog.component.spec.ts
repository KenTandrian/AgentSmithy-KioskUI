import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HowItWorksDialogComponent } from './how-it-works-dialog.component';

describe('HowItWorksDialogComponent', () => {
  let component: HowItWorksDialogComponent;
  let fixture: ComponentFixture<HowItWorksDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HowItWorksDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HowItWorksDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
