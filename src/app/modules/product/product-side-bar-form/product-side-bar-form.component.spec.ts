import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductSideBarFormComponent } from './product-side-bar-form.component';

describe('ProductSideBarFormComponent', () => {
  let component: ProductSideBarFormComponent;
  let fixture: ComponentFixture<ProductSideBarFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProductSideBarFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductSideBarFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
