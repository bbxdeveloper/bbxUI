import { TestBed } from '@angular/core/testing';

import { CustomerSelectionService } from './customer-selection.service';

describe('CustomerSelectionService', () => {
  let service: CustomerSelectionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CustomerSelectionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
