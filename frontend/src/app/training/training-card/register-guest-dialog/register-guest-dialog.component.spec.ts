import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterGuestDialogComponent } from './register-guest-dialog.component';

describe('RegisterGuestDialogComponent', () => {
  let component: RegisterGuestDialogComponent;
  let fixture: ComponentFixture<RegisterGuestDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RegisterGuestDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisterGuestDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
