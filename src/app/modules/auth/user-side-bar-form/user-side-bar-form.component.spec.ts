import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserSideBarFormComponent } from './user-side-bar-form.component';

describe('UserSideBarFormComponent', () => {
  let component: UserSideBarFormComponent;
  let fixture: ComponentFixture<UserSideBarFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserSideBarFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserSideBarFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
