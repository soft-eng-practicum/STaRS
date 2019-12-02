import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TabsPage } from './tabs.page';


describe('TabsPage', () => {
  let component: TabsPage;
  let fixture: ComponentFixture<TabsPage>;
 
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TabsPage],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports: [RouterTestingModule]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TabsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should ensure the user logs out', () => {
    //Arrange
    var doc = document.getElementById('logoutButton');
    //Act
    doc.click();
    //Assert
    expect(document.URL).not.toContain('home/tabs/tab');
  })

  it('should ensure the logout function is called', () => {
    //Arrange
    var spy = spyOn(component, 'logout');
    var doc = document.getElementById('logoutButton');
    //Act
    doc.click();
    //Assert
    expect(spy).toHaveBeenCalled();
  })
});
