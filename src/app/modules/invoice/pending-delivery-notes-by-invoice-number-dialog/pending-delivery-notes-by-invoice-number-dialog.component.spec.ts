import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PendingDeliveryNotesByInvoiceNumberDialogComponent } from './pending-delivery-notes-by-invoice-number-dialog.component';

describe('PendingDeliveryNotesByInvoiceNumberDialogComponent', () => {
  let component: PendingDeliveryNotesByInvoiceNumberDialogComponent;
  let fixture: ComponentFixture<PendingDeliveryNotesByInvoiceNumberDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PendingDeliveryNotesByInvoiceNumberDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PendingDeliveryNotesByInvoiceNumberDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
