import { TestBed } from '@angular/core/testing';

import { KeyboardNavigationService } from './keyboard-navigation.service';

describe('KeyboardNavigationService', () => {
  let service: KeyboardNavigationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(KeyboardNavigationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
