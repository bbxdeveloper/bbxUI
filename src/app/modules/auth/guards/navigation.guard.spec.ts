import { TestBed } from '@angular/core/testing';

import { NavigationGuard } from './navigation.guard';

describe('NavigationGuard', () => {
  let guard: NavigationGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(NavigationGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
