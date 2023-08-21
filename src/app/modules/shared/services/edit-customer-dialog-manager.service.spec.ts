import { TestBed } from '@angular/core/testing';

import { EditCustomerDialogManagerService } from './edit-customer-dialog-manager.service';

describe('EditCustomerDialogManagerService', () => {
  let service: EditCustomerDialogManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EditCustomerDialogManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
