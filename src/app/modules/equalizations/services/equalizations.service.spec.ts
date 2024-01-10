import { TestBed } from '@angular/core/testing';

import { EqualizationsService } from './equalizations.service';

describe('EqualizationsService', () => {
  let service: EqualizationsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EqualizationsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
