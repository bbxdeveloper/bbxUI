import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnbalancedInvoicesNavigationFilterFormComponent } from './unbalanced-invoices-navigation-filter-form.component';

describe('UnbalancedInvoicesNavigationFilterFormComponent', () => {
  let component: UnbalancedInvoicesNavigationFilterFormComponent;
  let fixture: ComponentFixture<UnbalancedInvoicesNavigationFilterFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UnbalancedInvoicesNavigationFilterFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UnbalancedInvoicesNavigationFilterFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
