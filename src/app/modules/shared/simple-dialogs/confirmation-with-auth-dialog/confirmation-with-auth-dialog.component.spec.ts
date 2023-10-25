import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmationWithAuthDialogComponent } from './confirmation-with-auth-dialog.component';

describe('ConfirmationWithAuthDialogComponent', () => {
  let component: ConfirmationWithAuthDialogComponent;
  let fixture: ComponentFixture<ConfirmationWithAuthDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConfirmationWithAuthDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmationWithAuthDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
