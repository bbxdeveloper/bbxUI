import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CorrectionInvoiceComponent } from './correction-invoice.component';

describe('CorrectionInvoiceComponent', () => {
  let component: CorrectionInvoiceComponent;
  let fixture: ComponentFixture<CorrectionInvoiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CorrectionInvoiceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CorrectionInvoiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
