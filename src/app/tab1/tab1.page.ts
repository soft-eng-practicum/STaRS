import { Component } from '@angular/core';
import { PouchService } from 'src/app/pouch.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {

  currentUser: any;
  currentUserSurveys: any;
  posters: any = [];

  constructor(private pouchService: PouchService) {
    this.currentUser = this.pouchService.globalUser;
    this.currentUserSurveys = this.pouchService.globalUserDoc.surveys;
    this.pouchService.getAllPosters();
    // this.posters = this.pouchService.posters;
    // debugger;
    // console.log(this.posters);
  }

  testMethod() {
    // this.pouchService.info();
  }
}
