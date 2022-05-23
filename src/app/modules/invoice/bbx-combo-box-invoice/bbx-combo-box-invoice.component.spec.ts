import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BbxComboBoxInvoiceComponent } from './bbx-combo-box-invoice.component';

describe('BbxComboBoxInvoiceComponent', () => {
  let component: BbxComboBoxInvoiceComponent;
  let fixture: ComponentFixture<BbxComboBoxInvoiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BbxComboBoxInvoiceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BbxComboBoxInvoiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
