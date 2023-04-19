import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReceiptDataFormComponent } from './receipt-data-form.component';

describe('ReceiptDataFormComponent', () => {
  let component: ReceiptDataFormComponent;
  let fixture: ComponentFixture<ReceiptDataFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReceiptDataFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReceiptDataFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
