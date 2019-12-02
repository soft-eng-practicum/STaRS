import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
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
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

beforeEach(() => {
  fixture = TestBed.createComponent(LoginPage);
  component = fixture.componentInstance;  
 
  fixture.detectChanges();
});

  it('should create component', () => {
    //Assert that the component is created
    expect(component).toBeTruthy();
  });
  it('should attempt to login a user after login is clicked', () => {
    //Arrange
    var username = document.getElementById('username');
    var submitButton = document.getElementById('submitButton');
    //Act
    username.textContent = '';
    spyOn(component, 'loginUser');
    submitButton.click();
    //Assert
    //loginUser is called
    expect(component.loginUser).toHaveBeenCalled();
  });

  it('should not navigate to the next page with invalid credentials', () => {
    //Arrange
    var username = document.getElementById('username');
    var submitButton = document.getElementById('submitButton');
    //Act
    username.textContent = '';
    submitButton.click();
    //Assert
    expect(document.URL).not.toContain('/home/tabs/tab');
  });
  });
