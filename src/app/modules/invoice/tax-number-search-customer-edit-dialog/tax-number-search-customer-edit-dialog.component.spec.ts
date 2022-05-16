import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaxNumberSearchCustomerEditDialogComponent } from './tax-number-search-customer-edit-dialog.component';

describe('TaxNumberSearchCustomerEditDialogComponent', () => {
  let component: TaxNumberSearchCustomerEditDialogComponent;
  let fixture: ComponentFixture<TaxNumberSearchCustomerEditDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TaxNumberSearchCustomerEditDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TaxNumberSearchCustomerEditDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
