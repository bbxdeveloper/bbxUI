import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeadLineComponent } from './head-line.component';

describe('HeadLineComponent', () => {
  let component: HeadLineComponent;
  let fixture: ComponentFixture<HeadLineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HeadLineComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HeadLineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
