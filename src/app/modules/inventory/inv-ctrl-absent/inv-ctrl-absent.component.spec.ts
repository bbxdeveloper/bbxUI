import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvCtrlAbsentComponent } from './inv-ctrl-absent.component';

describe('InvCtrlAbsentComponent', () => {
  let component: InvCtrlAbsentComponent;
  let fixture: ComponentFixture<InvCtrlAbsentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InvCtrlAbsentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InvCtrlAbsentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
