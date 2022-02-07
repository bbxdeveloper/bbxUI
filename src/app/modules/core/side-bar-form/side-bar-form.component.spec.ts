import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SideBarFormComponent } from './side-bar-form.component';

describe('SideBarFormComponent', () => {
  let component: SideBarFormComponent;
  let fixture: ComponentFixture<SideBarFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SideBarFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SideBarFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
