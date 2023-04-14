import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavigatableBuildingBlockComponent } from './navigatable-building-block.component';

describe('NavigatableBuildingBlockComponent', () => {
  let component: NavigatableBuildingBlockComponent;
  let fixture: ComponentFixture<NavigatableBuildingBlockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NavigatableBuildingBlockComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NavigatableBuildingBlockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
