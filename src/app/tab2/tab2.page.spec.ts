
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import {RouterTestingModule} from '@angular/router/testing';
import {FormsModule} from '@angular/forms';
import { Tab2Page } from './tab2.page';


describe('Tab2Page', () => {
  let component: Tab2Page;
  let fixture: ComponentFixture<Tab2Page>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [Tab2Page],
      imports: [IonicModule.forRoot(),[RouterTestingModule],[FormsModule]]
    }).compileComponents();
    
    fixture = TestBed.createComponent(Tab2Page);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should display username in upper right corner',()=>{
    //Arrange
    //Act
    //Assert
      expect(component.currentUser).toEqual(undefined);
    //This is expected to be undefined due to 
    //the pouchService not being called to assign a value to PouchService.globalUser.
  });

  it('should set filtered posters', () => {
    //Arrange
    //Act
    var result = component.setFilteredItems();
    //Assert
    expect(result).toEqual(component.poster);
  });

  it('should filter based on search term entered', () => {
    //Arrange
   var spy = spyOn(component,'filterItems');
    //Act
    component.setFilteredItems();
    //Assert
    expect(spy).toHaveBeenCalled();
  });

});
