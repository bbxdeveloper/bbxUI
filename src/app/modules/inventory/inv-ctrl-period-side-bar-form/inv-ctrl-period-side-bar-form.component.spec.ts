import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvCtrlPeriodSideBarFormComponent } from './inv-ctrl-period-side-bar-form.component';

describe('InvCtrlPeriodSideBarFormComponent', () => {
  let component: InvCtrlPeriodSideBarFormComponent;
  let fixture: ComponentFixture<InvCtrlPeriodSideBarFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InvCtrlPeriodSideBarFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InvCtrlPeriodSideBarFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
