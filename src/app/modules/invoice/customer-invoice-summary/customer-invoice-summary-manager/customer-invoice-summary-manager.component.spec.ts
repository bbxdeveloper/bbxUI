import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerInvoiceSummaryManagerComponent } from './customer-invoice-summary-manager.component';

describe('CustomerInvoiceSummaryManagerComponent', () => {
  let component: CustomerInvoiceSummaryManagerComponent;
  let fixture: ComponentFixture<CustomerInvoiceSummaryManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CustomerInvoiceSummaryManagerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomerInvoiceSummaryManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
