import { TestBed } from '@angular/core/testing';

import { PocService } from './poc.service';

describe('PocService', () => {
  let service: PocService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PocService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
