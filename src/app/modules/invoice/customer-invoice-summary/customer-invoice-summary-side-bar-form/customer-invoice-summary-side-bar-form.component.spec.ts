import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerInvoiceSummarySideBarFormComponent } from './customer-invoice-summary-side-bar-form.component';

describe('CustomerInvoiceSummarySideBarFormComponent', () => {
  let component: CustomerInvoiceSummarySideBarFormComponent;
  let fixture: ComponentFixture<CustomerInvoiceSummarySideBarFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CustomerInvoiceSummarySideBarFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomerInvoiceSummarySideBarFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
