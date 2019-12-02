import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Tab4Page } from './tab4.page';

describe('Tab4Page', () => {
  let component: Tab4Page;
  let fixture: ComponentFixture<Tab4Page>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Tab4Page ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Tab4Page);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });


  //TODO
  //Need to remove this component. Currently keeping it in due to it 
  //possibly affecting the routing of the application.
  //This page has no purpose.
  //To see it, launch the app in browser and naviagte to localhost:****/home/tabs/tab4
});
