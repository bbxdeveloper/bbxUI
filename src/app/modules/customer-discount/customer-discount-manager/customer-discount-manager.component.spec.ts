import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerDiscountManagerComponent } from './customer-discount-manager.component';

describe('CustomerDiscountManagerComponent', () => {
  let component: CustomerDiscountManagerComponent;
  let fixture: ComponentFixture<CustomerDiscountManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CustomerDiscountManagerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomerDiscountManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
