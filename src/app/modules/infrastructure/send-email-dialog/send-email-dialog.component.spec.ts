import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SendEmailDialogComponent } from './send-email-dialog.component';

describe('SendEmailDialogComponent', () => {
  let component: SendEmailDialogComponent;
  let fixture: ComponentFixture<SendEmailDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SendEmailDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SendEmailDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
