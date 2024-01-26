import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoiceNavFilterFormComponent } from './invoice-nav-filter-form.component';

describe('InvoiceNavFilterFormComponent', () => {
  let component: InvoiceNavFilterFormComponent;
  let fixture: ComponentFixture<InvoiceNavFilterFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InvoiceNavFilterFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InvoiceNavFilterFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
