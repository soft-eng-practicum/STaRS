import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PosterListPage } from './poster-list.page';

describe('PosterListPage', () => {
  let component: PosterListPage;
  let fixture: ComponentFixture<PosterListPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PosterListPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PosterListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
