import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerSideBarFormComponent } from './customer-side-bar-form.component';

describe('CustomerSideBarFormComponent', () => {
  let component: CustomerSideBarFormComponent;
  let fixture: ComponentFixture<CustomerSideBarFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CustomerSideBarFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomerSideBarFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
