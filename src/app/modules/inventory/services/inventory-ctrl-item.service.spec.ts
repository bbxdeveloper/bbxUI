import { TestBed } from '@angular/core/testing';

import { InventoryCtrlItemService } from './inventory-ctrl-item.service';

describe('InventoryCtrlItemService', () => {
  let service: InventoryCtrlItemService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InventoryCtrlItemService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
