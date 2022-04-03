import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductSelectTableDialogComponent } from './product-select-table-dialog.component';

describe('ProductSelectTableDialogComponent', () => {
  let component: ProductSelectTableDialogComponent;
  let fixture: ComponentFixture<ProductSelectTableDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProductSelectTableDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductSelectTableDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
