import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BaseManagerComponent } from './base-manager.component';

describe('BaseManagerComponent', () => {
  let component: BaseManagerComponent;
  let fixture: ComponentFixture<BaseManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BaseManagerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BaseManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
