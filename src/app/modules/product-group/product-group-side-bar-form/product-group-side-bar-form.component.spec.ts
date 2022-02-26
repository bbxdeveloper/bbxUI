import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductGroupSideBarFormComponent } from './product-group-side-bar-form.component';

describe('ProductGroupSideBarFormComponent', () => {
  let component: ProductGroupSideBarFormComponent;
  let fixture: ComponentFixture<ProductGroupSideBarFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProductGroupSideBarFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductGroupSideBarFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
