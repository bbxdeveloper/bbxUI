import { TestBed } from '@angular/core/testing';

import { InvoiceStatisticsService } from './invoice-statistics.service';

describe('InvoiceStatisticsService', () => {
  let service: InvoiceStatisticsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InvoiceStatisticsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
