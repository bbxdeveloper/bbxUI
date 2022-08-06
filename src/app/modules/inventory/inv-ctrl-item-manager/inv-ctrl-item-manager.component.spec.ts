import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvCtrlItemManagerComponent } from './inv-ctrl-item-manager.component';

describe('InvCtrlItemManagerComponent', () => {
  let component: InvCtrlItemManagerComponent;
  let fixture: ComponentFixture<InvCtrlItemManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InvCtrlItemManagerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InvCtrlItemManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
