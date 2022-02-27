import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PocSideBarFormComponent } from './poc-side-bar-form.component';

describe('PocSideBarFormComponent', () => {
  let component: PocSideBarFormComponent;
  let fixture: ComponentFixture<PocSideBarFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PocSideBarFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PocSideBarFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
