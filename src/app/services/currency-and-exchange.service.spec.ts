import { TestBed } from '@angular/core/testing';

import { CurrencyAndExchangeService } from './currency-and-exchange.service';

describe('CurrencyAndExchangeService', () => {
  let service: CurrencyAndExchangeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CurrencyAndExchangeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
