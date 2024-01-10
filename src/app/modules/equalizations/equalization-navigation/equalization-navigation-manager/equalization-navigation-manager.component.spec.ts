import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EqualizationNavigationManagerComponent } from './equalization-navigation-manager.component';

describe('EqualizationNavigationManagerComponent', () => {
  let component: EqualizationNavigationManagerComponent;
  let fixture: ComponentFixture<EqualizationNavigationManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EqualizationNavigationManagerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EqualizationNavigationManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
