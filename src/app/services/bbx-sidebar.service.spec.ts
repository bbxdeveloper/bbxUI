import { TestBed } from '@angular/core/testing';

import { BbxSidebarService } from './bbx-sidebar.service';

describe('BbxSidebarService', () => {
  let service: BbxSidebarService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BbxSidebarService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
