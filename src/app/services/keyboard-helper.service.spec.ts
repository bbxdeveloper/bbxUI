import { TestBed } from '@angular/core/testing';

import { KeyboardHelperService } from './keyboard-helper.service';

describe('KeyboardHelperService', () => {
  let service: KeyboardHelperService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(KeyboardHelperService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
