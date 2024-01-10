import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EqualizationCreatorComponent } from './equalization-creator.component';

describe('EqualizationCreatorComponent', () => {
  let component: EqualizationCreatorComponent;
  let fixture: ComponentFixture<EqualizationCreatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EqualizationCreatorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EqualizationCreatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
