import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerBankAccountNumberInputComponent } from './customer-bank-account-number-input.component';

describe('CustomerBankAccountNumberInputComponent', () => {
  let component: CustomerBankAccountNumberInputComponent;
  let fixture: ComponentFixture<CustomerBankAccountNumberInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CustomerBankAccountNumberInputComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomerBankAccountNumberInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
