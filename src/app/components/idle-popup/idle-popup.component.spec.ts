import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IdlePopupComponent } from './idle-popup.component';

describe('IdlePopupComponent', () => {
  let component: IdlePopupComponent;
  let fixture: ComponentFixture<IdlePopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [IdlePopupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IdlePopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
