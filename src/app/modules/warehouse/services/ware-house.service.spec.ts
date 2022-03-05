import { TestBed } from '@angular/core/testing';

import { WareHouseService } from './ware-house.service';

describe('WareHouseService', () => {
  let service: WareHouseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WareHouseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
