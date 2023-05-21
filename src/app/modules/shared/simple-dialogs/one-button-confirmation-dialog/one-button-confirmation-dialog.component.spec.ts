import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OneButtonConfirmationDialogComponent } from './one-button-confirmation-dialog.component';

describe('OneButtonConfirmationDialogComponent', () => {
  let component: OneButtonConfirmationDialogComponent;
  let fixture: ComponentFixture<OneButtonConfirmationDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OneButtonConfirmationDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OneButtonConfirmationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
