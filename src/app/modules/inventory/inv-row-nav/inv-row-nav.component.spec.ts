import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvRowNavComponent } from './inv-row-nav.component';

describe('InvRowNavComponent', () => {
  let component: InvRowNavComponent;
  let fixture: ComponentFixture<InvRowNavComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InvRowNavComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InvRowNavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
