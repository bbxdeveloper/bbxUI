import { TestBed } from '@angular/core/testing';

import { VatRateService } from './vat-rate.service';

describe('VatRateService', () => {
  let service: VatRateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VatRateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
