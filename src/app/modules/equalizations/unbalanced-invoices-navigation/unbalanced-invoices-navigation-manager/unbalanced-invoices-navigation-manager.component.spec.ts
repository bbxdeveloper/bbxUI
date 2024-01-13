import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnbalancedInvoicesNavigationManagerComponent } from './unbalanced-invoices-navigation-manager.component';

describe('UnbalancedInvoicesNavigationManagerComponent', () => {
  let component: UnbalancedInvoicesNavigationManagerComponent;
  let fixture: ComponentFixture<UnbalancedInvoicesNavigationManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UnbalancedInvoicesNavigationManagerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UnbalancedInvoicesNavigationManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
