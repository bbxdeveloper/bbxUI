import { TestBed } from '@angular/core/testing';

import { StockCardService } from './stock-card.service';

describe('StockCardService', () => {
  let service: StockCardService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StockCardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
