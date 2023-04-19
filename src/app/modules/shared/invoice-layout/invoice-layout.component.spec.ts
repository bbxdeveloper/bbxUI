import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoiceLayoutComponent } from './invoice-layout.component';

describe('InvoiceLayoutComponent', () => {
  let component: InvoiceLayoutComponent;
  let fixture: ComponentFixture<InvoiceLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InvoiceLayoutComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InvoiceLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
