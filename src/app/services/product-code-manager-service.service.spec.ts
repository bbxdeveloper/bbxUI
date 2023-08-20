import { TestBed } from '@angular/core/testing';

import { ProductCodeManagerServiceService } from './product-code-manager-service.service';

describe('ProductCodeManagerServiceService', () => {
  let service: ProductCodeManagerServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProductCodeManagerServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
