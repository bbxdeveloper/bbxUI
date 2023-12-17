import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EqualizationNavigationSideBarFormComponent } from './equalization-navigation-side-bar-form.component';

describe('EqualizationNavigationSideBarFormComponent', () => {
  let component: EqualizationNavigationSideBarFormComponent;
  let fixture: ComponentFixture<EqualizationNavigationSideBarFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EqualizationNavigationSideBarFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EqualizationNavigationSideBarFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
