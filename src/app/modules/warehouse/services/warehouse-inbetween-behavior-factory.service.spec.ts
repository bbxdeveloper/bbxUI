import { TestBed } from '@angular/core/testing';

import { WarehouseInbetweenBehaviorFactoryService } from './warehouse-inbetween-behavior-factory.service';

describe('WarehouseInbetweenBehaviorFactoryService', () => {
  let service: WarehouseInbetweenBehaviorFactoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WarehouseInbetweenBehaviorFactoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
