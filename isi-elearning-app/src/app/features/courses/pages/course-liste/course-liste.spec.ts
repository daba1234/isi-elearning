import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CourseListe } from './course-liste';

describe('CourseListe', () => {
  let component: CourseListe;
  let fixture: ComponentFixture<CourseListe>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CourseListe],
    }).compileComponents();

    fixture = TestBed.createComponent(CourseListe);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
