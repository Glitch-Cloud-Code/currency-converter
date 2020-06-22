import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ValueOverTimeComponent } from './value-over-time.component';

describe('ValueOverTimeComponent', () => {
  let component: ValueOverTimeComponent;
  let fixture: ComponentFixture<ValueOverTimeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ValueOverTimeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ValueOverTimeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
