import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoiceNavSideBarFormComponent } from './invoice-nav-side-bar-form.component';

describe('InvoiceNavSideBarFormComponent', () => {
  let component: InvoiceNavSideBarFormComponent;
  let fixture: ComponentFixture<InvoiceNavSideBarFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InvoiceNavSideBarFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InvoiceNavSideBarFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
