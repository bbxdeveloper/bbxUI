import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PendingDeliveryNotesSelectDialogComponent } from './pending-delivery-notes-select-dialog.component';

describe('PendingDeliveryNotesSelectDialogComponent', () => {
  let component: PendingDeliveryNotesSelectDialogComponent;
  let fixture: ComponentFixture<PendingDeliveryNotesSelectDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PendingDeliveryNotesSelectDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PendingDeliveryNotesSelectDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
