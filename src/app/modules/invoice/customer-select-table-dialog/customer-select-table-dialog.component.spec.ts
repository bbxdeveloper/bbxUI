import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerSelectTableDialogComponent } from './customer-select-table-dialog.component';

describe('CustomerSelectTableDialogComponent', () => {
  let component: CustomerSelectTableDialogComponent;
  let fixture: ComponentFixture<CustomerSelectTableDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CustomerSelectTableDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomerSelectTableDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
