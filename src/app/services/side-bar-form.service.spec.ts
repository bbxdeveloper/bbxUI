import { TestBed } from '@angular/core/testing';

import { SideBarFormService } from './side-bar-form.service';

describe('SideBarFormService', () => {
  let service: SideBarFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SideBarFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
