import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FoxIconComponent } from './fox-icon.component';

describe('FoxIconComponent', () => {
  let component: FoxIconComponent;
  let fixture: ComponentFixture<FoxIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FoxIconComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FoxIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
