import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EqualizationNavigationFilterFormComponent } from './equalization-navigation-filter-form.component';

describe('EqualizationNavigationFilterFormComponent', () => {
  let component: EqualizationNavigationFilterFormComponent;
  let fixture: ComponentFixture<EqualizationNavigationFilterFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EqualizationNavigationFilterFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EqualizationNavigationFilterFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
