import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomersHasPendingInvoiceComponent } from './customers-has-pending-invoice.component';

describe('CustomersHasPendingInvoiceComponent', () => {
  let component: CustomersHasPendingInvoiceComponent;
  let fixture: ComponentFixture<CustomersHasPendingInvoiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CustomersHasPendingInvoiceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomersHasPendingInvoiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
