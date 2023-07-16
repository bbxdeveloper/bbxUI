import { TestBed } from '@angular/core/testing';

import { PartnerLockHandlerService } from './partner-lock-handler.service';

describe('PartnerLockHandlerService', () => {
  let service: PartnerLockHandlerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PartnerLockHandlerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
