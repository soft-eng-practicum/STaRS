import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import {FormsModule} from '@angular/forms';
import { Tab1Page } from './tab1.page';
import { RouterTestingModule } from '@angular/router/testing';
import {DebugElement} from '@angular/core'
import { By } from '@angular/platform-browser';


describe('Tab1Page', () => {
  let component: Tab1Page;
  let fixture: ComponentFixture<Tab1Page>;
  let DebugElement: DebugElement;
  let htmlElement: HTMLElement;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [Tab1Page],
      imports: [IonicModule.forRoot(), [FormsModule], [RouterTestingModule]]
    }).compileComponents();

    fixture = TestBed.createComponent(Tab1Page);
    component = fixture.componentInstance;
    DebugElement = fixture.debugElement.query(By.css('ion-label'));
    htmlElement = DebugElement.nativeElement;
    fixture.detectChanges();
  }));

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should display username in top left corner', () => {
    var username = component.currentUser;
    if(username == undefined){
      username = '';
    }

    expect(htmlElement.textContent).toEqual(username);
  });
  
  it('should open the survey',() => {
  //Arrange
  var surveybutton = document.getElementById('surveybutton');
  //Act
  spyOn(window, 'open');
  surveybutton.click();
  //Assert
  expect(window.open).toHaveBeenCalled();

  });
});
