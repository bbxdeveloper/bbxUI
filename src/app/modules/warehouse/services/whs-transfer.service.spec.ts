import { TestBed } from '@angular/core/testing';

import { WhsTransferService } from './whs-transfer.service';

describe('WhsTransferService', () => {
  let service: WhsTransferService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WhsTransferService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
