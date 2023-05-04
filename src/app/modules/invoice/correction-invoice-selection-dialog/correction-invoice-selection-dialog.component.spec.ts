import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CorrectionInvoiceSelectionDialogComponent } from './correction-invoice-selection-dialog.component';

describe('CorrectionInvoiceSelectionDialogComponent', () => {
  let component: CorrectionInvoiceSelectionDialogComponent;
  let fixture: ComponentFixture<CorrectionInvoiceSelectionDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CorrectionInvoiceSelectionDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CorrectionInvoiceSelectionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
