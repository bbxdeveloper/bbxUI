import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlatDesignTableComponent } from './flat-design-table.component';

describe('FlatDesignTableComponent', () => {
  let component: FlatDesignTableComponent;
  let fixture: ComponentFixture<FlatDesignTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlatDesignTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlatDesignTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
