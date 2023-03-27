import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContInvCtrlComponent } from './cont-inv-ctrl.component';

describe('ContInvCtrlComponent', () => {
  let component: ContInvCtrlComponent;
  let fixture: ComponentFixture<ContInvCtrlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ContInvCtrlComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ContInvCtrlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
