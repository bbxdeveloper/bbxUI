import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoiceCustomerComponent } from './invoice-customer.component';

describe('InvoiceCustomerComponent', () => {
  let component: InvoiceCustomerComponent;
  let fixture: ComponentFixture<InvoiceCustomerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InvoiceCustomerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InvoiceCustomerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
