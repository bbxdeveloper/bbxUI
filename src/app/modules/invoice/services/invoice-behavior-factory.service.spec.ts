import { TestBed } from '@angular/core/testing';

import { InvoiceBehaviorFactoryService } from './invoice-behavior-factory.service';

describe('InvoiceBehaviorFactoryService', () => {
  let service: InvoiceBehaviorFactoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InvoiceBehaviorFactoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
