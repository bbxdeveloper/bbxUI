import { TestBed } from '@angular/core/testing';

import { PrintAndDownloadService } from './print-and-download.service';

describe('UtilityService', () => {
  let service: PrintAndDownloadService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PrintAndDownloadService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
