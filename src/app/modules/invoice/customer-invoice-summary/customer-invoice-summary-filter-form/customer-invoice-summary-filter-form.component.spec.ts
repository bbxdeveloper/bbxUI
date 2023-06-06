import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerInvoiceSummaryFilterFormComponent } from './customer-invoice-summary-filter-form.component';

describe('CustomerInvoiceSummaryFilterFormComponent', () => {
  let component: CustomerInvoiceSummaryFilterFormComponent;
  let fixture: ComponentFixture<CustomerInvoiceSummaryFilterFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CustomerInvoiceSummaryFilterFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomerInvoiceSummaryFilterFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
