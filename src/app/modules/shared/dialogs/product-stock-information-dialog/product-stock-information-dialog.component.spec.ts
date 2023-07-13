import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductStockInformationDialogComponent } from './product-stock-information-dialog.component';

describe('ProductStockInformationDialogComponent', () => {
  let component: ProductStockInformationDialogComponent;
  let fixture: ComponentFixture<ProductStockInformationDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProductStockInformationDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductStockInformationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
