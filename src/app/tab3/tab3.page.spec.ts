import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { Tab3Page } from './tab3.page';

describe('Tab3Page', () => {
  let component: Tab3Page;
  let fixture: ComponentFixture<Tab3Page>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [Tab3Page],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(Tab3Page);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  //TODO
  //Need to remove this component. Currently keeping it in due to it 
  //possibly affecting the routing of the application.
  //This page has no purpose.
  //To see it, launch the app in browser and naviagte to localhost:****/home/tabs/tab3
});
