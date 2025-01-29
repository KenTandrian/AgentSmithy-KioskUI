import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodeDialogComponent } from './code-dialog.component';

describe('CodeDialogComponent', () => {
  let component: CodeDialogComponent;
  let fixture: ComponentFixture<CodeDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CodeDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CodeDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
