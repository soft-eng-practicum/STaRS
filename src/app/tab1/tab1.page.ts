import { Component } from '@angular/core';
import { PouchService } from 'src/app/pouch.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {

  constructor(private pouchService: PouchService) {
    this.pouchService.info();
  }

  testMethod() {
    // this.pouchService.info();
  }
}
