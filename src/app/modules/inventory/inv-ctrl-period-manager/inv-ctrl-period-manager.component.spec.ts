import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvCtrlPeriodManagerComponent } from './inv-ctrl-period-manager.component';

describe('InvCtrlPeriodManagerComponent', () => {
  let component: InvCtrlPeriodManagerComponent;
  let fixture: ComponentFixture<InvCtrlPeriodManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InvCtrlPeriodManagerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InvCtrlPeriodManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
