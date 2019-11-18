import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import {RouterModule, Routes} from '@angular/router'
import { TabsPage } from './tabs.page';


describe('TabsPage', () => {
  let component: TabsPage;
  let fixture: ComponentFixture<TabsPage>;
  const routes: Routes = [
    {
      path: 'tabs',
      component: TabsPage,
      children: [
        {
          path: 'tab1',
          children: [
            {
              path: '',
              loadChildren: () =>
                import('../tab1/tab1.module').then(m => m.Tab1PageModule)
            }
          ]
        },
        {
          path: 'tab2',
          children: [
            {
              path: '',
              loadChildren: () =>
                import('../tab2/tab2.module').then(m => m.Tab2PageModule)
            }
          ]
        },
        {
          path: 'tab3',
          children: [
            {
              path: '',
              loadChildren: () =>
                import('../tab3/tab3.module').then(m => m.Tab3PageModule)
            }
          ]
        },
        {
          path: 'tab4',
          children: [
            {
              path: '',
              loadChildren: () =>
                import('../tab4/tab4.module').then(m => m.Tab4PageModule)
            }
          ]
        },
        {
          path: '',
          redirectTo: '/tabs/tab1',
          pathMatch: 'full'
        }
      ]
    },
    {
      path: '',
      redirectTo: '/tabs/tab1',
      pathMatch: 'full'
    }
  ];

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TabsPage],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports: [RouterModule.forRoot(routes)]
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
});
