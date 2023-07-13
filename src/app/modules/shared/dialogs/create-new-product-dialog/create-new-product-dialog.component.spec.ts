import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateNewProductDialogComponent } from './create-new-product-dialog.component';

describe('CreateNewProductDialogComponent', () => {
  let component: CreateNewProductDialogComponent;
  let fixture: ComponentFixture<CreateNewProductDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateNewProductDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateNewProductDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
