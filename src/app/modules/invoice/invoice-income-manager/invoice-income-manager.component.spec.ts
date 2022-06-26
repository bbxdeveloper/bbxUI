import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoiceIncomeManagerComponent } from './invoice-income-manager.component';

describe('InvoiceIncomeManagerComponent', () => {
  let component: InvoiceIncomeManagerComponent;
  let fixture: ComponentFixture<InvoiceIncomeManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InvoiceIncomeManagerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InvoiceIncomeManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
