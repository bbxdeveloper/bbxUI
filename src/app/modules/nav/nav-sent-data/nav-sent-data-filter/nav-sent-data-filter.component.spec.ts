import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavSentDataFilterComponent } from './nav-sent-data-filter.component';

describe('NavSentDataFilterComponent', () => {
  let component: NavSentDataFilterComponent;
  let fixture: ComponentFixture<NavSentDataFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NavSentDataFilterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NavSentDataFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
