import { TestBed } from '@angular/core/testing';

import { NavService } from './nav.service';

describe('NavServiceService', () => {
  let service: NavService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NavService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
