import { TestBed } from '@angular/core/testing';

import { WhsService } from './whs.service';

describe('WhsService', () => {
  let service: WhsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WhsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
