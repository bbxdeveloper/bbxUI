import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthFieldsComponent } from './auth-fields.component';

describe('AuthFormComponent', () => {
  let component: AuthFieldsComponent;
  let fixture: ComponentFixture<AuthFieldsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AuthFieldsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthFieldsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
