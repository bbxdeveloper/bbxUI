import { TestBed } from '@angular/core/testing';

import { PartnerLockService } from './partner-lock.service';

describe('PartnerLockService', () => {
  let service: PartnerLockService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PartnerLockService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
