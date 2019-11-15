import { Component } from '@angular/core';
import { PouchService } from 'src/app/pouch.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {

  test: any;

  constructor(private pouchService: PouchService) {
    this.test = this.pouchService.globalUser;
    this.pouchService.getDocs().then(result => {
      for (const i of result.rows) {
        console.log(i.doc.username);
      }
      console.log('TEST');
    });
  }

  testMethod() {
    // this.pouchService.info();
  }
}
