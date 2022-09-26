import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductGroupSelectTableDialogComponent } from './product-group-select-table-dialog.component';

describe('ProductGroupSelectTableDialogComponent', () => {
  let component: ProductGroupSelectTableDialogComponent;
  let fixture: ComponentFixture<ProductGroupSelectTableDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProductGroupSelectTableDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductGroupSelectTableDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
