import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductGroupManagerComponent } from './product-group-manager.component';

describe('ProductGroupManagerComponent', () => {
  let component: ProductGroupManagerComponent;
  let fixture: ComponentFixture<ProductGroupManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProductGroupManagerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductGroupManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
