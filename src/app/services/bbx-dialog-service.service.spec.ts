import { TestBed } from '@angular/core/testing';

import { BbxDialogServiceService } from './bbx-dialog-service.service';

describe('BbxDialogServiceService', () => {
  let service: BbxDialogServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BbxDialogServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
