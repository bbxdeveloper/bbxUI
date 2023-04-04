import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalculatorPopoverComponent } from './calculator-popover.component';

describe('CalculatorPopoverComponent', () => {
  let component: CalculatorPopoverComponent;
  let fixture: ComponentFixture<CalculatorPopoverComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CalculatorPopoverComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CalculatorPopoverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
