import { TestBed } from '@angular/core/testing';

import { BbxToastrService } from './bbx-toastr-service.service';

describe('BbxToastrService', () => {
  let service: BbxToastrService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BbxToastrService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
