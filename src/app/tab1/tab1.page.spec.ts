import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule, IonRefresher, IonRefresherContent } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { Tab1Page } from './tab1.page';
import { RouterTestingModule } from '@angular/router/testing';
import { PouchService } from '../pouch.service';

describe('Tab1Page', () => {
  let component: Tab1Page;
  let fixture: ComponentFixture<Tab1Page>;
  let pouchServiceSpy;
  beforeEach(async(() => {

  
    //Created a spy for the pouch service. This allows the component to be defined, 
    //however the mock itself does not hold any values and is undefined. 
    pouchServiceSpy = jasmine.createSpyObj('PouchService',{
      globalUser:  '',
      pouchJudges:  '',
      pouchPosters: '',
      globalUserDoc: '',
      posters: '', 
      password: '',
      surveyQuestions: '',
      getAllPosters: '',
      getPoster: '',
      filterItems: ''
    });
    
    TestBed.configureTestingModule({
      imports: [IonicModule.forRoot(), [FormsModule], [RouterTestingModule]],
      declarations: [Tab1Page],
      //Sets the PouchService provider to the spy created above.
     providers: [Tab1Page,
    {provide: PouchService, useValue: pouchServiceSpy}
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Tab1Page);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create component', () => {
    //Arrange
    //Act
    //Assert
    expect(component).toBeTruthy();
  });

  it('information bubble should display popup message', () => {
    //Arrange
    var spy = spyOn(component,'test');
    var doc = document.getElementById('information-circle');
    //Act
    doc.click();
    //Assert
    expect(spy).toHaveBeenCalled();
  });

  it('should refresh the survey list', () => {
    //Arrange
    var spy = spyOn(component, 'doRefresh')
    //Act
    component.doRefresh(event);
    //Assert
    expect(spy).toHaveBeenCalled();
    expect(component.currentUserSurveys).toBeUndefined();
  });
  
  it('should open the survey',() => {
  //Arrange
  var spy = spyOn(window, 'open');
  var surveybutton = document.getElementById('surveybutton');
  //Act
  surveybutton.click();
  //Assert
  expect(window.open).toHaveBeenCalled();
  });
});
