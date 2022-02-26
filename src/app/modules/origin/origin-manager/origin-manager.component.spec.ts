import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OriginManagerComponent } from './origin-manager.component';

describe('OriginManagerComponent', () => {
  let component: OriginManagerComponent;
  let fixture: ComponentFixture<OriginManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OriginManagerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OriginManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
