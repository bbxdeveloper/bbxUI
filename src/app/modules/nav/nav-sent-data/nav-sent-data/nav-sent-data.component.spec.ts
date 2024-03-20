import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavSentDataComponent } from './nav-sent-data.component';

describe('NavSentDataComponent', () => {
  let component: NavSentDataComponent;
  let fixture: ComponentFixture<NavSentDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NavSentDataComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NavSentDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
