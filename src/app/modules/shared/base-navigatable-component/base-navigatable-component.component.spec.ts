import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BaseNavigatableComponentComponent } from './base-navigatable-component.component';

describe('BaseNavigatableComponentComponent', () => {
  let component: BaseNavigatableComponentComponent;
  let fixture: ComponentFixture<BaseNavigatableComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BaseNavigatableComponentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BaseNavigatableComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
