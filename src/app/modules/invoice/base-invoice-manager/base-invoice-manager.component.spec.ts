import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BaseInvoiceManagerComponent } from './base-invoice-manager.component';

describe('BaseInvoiceManagerComponent', () => {
  let component: BaseInvoiceManagerComponent;
  let fixture: ComponentFixture<BaseInvoiceManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BaseInvoiceManagerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BaseInvoiceManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
