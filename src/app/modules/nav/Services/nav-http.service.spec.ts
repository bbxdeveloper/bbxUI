import { TestBed } from '@angular/core/testing';

import { NavHttpService } from './nav-http.service';

describe('NavHttpService', () => {
  let service: NavHttpService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NavHttpService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
