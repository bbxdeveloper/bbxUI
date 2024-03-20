import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavSentDataSidebarFormComponent } from './nav-sent-data-sidebar-form.component';

describe('NavSentDataSidebarFormComponent', () => {
  let component: NavSentDataSidebarFormComponent;
  let fixture: ComponentFixture<NavSentDataSidebarFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NavSentDataSidebarFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NavSentDataSidebarFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
