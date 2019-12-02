import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed, inject } from '@angular/core/testing';
import { RouterTestingModule} from '@angular/router/testing';
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { FormsModule } from '@angular/forms';
import { PosterListPage } from './poster-list.page';
import { PouchService } from '../pouch.service';
import {IonicModule} from '@ionic/angular'
//As of now, This component cannot be created in a testing environment.

xdescribe('PosterListPage', () => {
  let component: PosterListPage;
  let fixture: ComponentFixture<PosterListPage>;
  let pouchServiceSpy;
  beforeEach(async(() => {
  
   /*pouchServiceSpy = jasmine.createSpyObj('PouchService',{
      globalUser: 'Spark1',
      pouchPosters: ' ',
      globalUserDoc: ' ',
      posters: ' ', 
      password: '12345',
      surveyQuestions: {name: 'brandon', Age: 12, Round: 'yes'},
      getAllPosters: '',
      getPoster: ' ',
      filterItems: ' '

    });*/
    TestBed.configureTestingModule({
      imports:   [[RouterTestingModule], [IonicModule.forRoot()],[HttpClientTestingModule], [FormsModule]],
      declarations: [ PosterListPage ]
      ,
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PosterListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should be created', () => {
    //TODO
    //Arrange
    //Act
    //Assert
    expect(component).toBeTruthy();
  });

  it('should display judges who have surveyed a specific poster', () => {
    //TODO
    //Arrange
    //Act
    //Assert
    expect(component.showJudges).toHaveBeenCalled();
  });

  it('should display information on a poster ', () => {
    //TODO
    //Arrange
    //Act
    //Assert
    expect(component.showInfo).toHaveBeenCalled();
  });

  it('should save the wordvalue of the 1-5 rating ', () => {
    //TODO
    //Arrange
    //Act
    //Assert
    expect(component).toEqual(component.surveyQuestions.wordvalue);
  });
  it('should display the proper toast messages at the proper time ', () => {
    //TODO
    //Arrange
    //Act
    //Assert
    expect(component.toastController.create).toHaveBeenCalled();
  });

});
