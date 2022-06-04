import { TestBed } from '@angular/core/testing';

import { InfrastructureService } from './infrastructure.service';

describe('InfrastructureService', () => {
  let service: InfrastructureService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InfrastructureService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
