import { TestBed } from '@angular/core/testing';

import { CustomerDiscountService } from './customer-discount.service';

describe('CustomerDiscountService', () => {
  let service: CustomerDiscountService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CustomerDiscountService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
