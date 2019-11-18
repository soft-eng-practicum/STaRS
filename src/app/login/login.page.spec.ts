import { CUSTOM_ELEMENTS_SCHEMA, DebugElement } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {FormsModule} from '@angular/forms';
import { LoginPage } from './login.page';


describe('LoginPage', () => {
  let component: LoginPage;
  let fixture: ComponentFixture<LoginPage>;
  
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule,
      FormsModule],
      declarations: [ LoginPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    });
   
    fixture = TestBed.createComponent(LoginPage);
    component = fixture.componentInstance;
  }));

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

   
    
});
