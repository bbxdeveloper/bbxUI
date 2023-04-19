import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoiceCustomerFormComponent } from './invoice-customer-form.component';

describe('InvoiceCustomerFormComponent', () => {
  let component: InvoiceCustomerFormComponent;
  let fixture: ComponentFixture<InvoiceCustomerFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InvoiceCustomerFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InvoiceCustomerFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
