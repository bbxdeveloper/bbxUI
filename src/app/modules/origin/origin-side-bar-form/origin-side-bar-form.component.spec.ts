import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OriginSideBarFormComponent } from './origin-side-bar-form.component';

describe('OriginSideBarFormComponent', () => {
  let component: OriginSideBarFormComponent;
  let fixture: ComponentFixture<OriginSideBarFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OriginSideBarFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OriginSideBarFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
