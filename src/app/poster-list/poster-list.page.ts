import { Component, OnInit } from '@angular/core';
import { PouchService } from 'src/app/pouch.service';


@Component({
  selector: 'app-poster-list',
  templateUrl: './poster-list.page.html',
  styleUrls: ['./poster-list.page.scss'],
})
export class PosterListPage implements OnInit {

  currentUser: any;
  surveyQuestions: any = [];

  constructor(private pouchService: PouchService) {
    this.currentUser = this.pouchService.globalUser;
    this.surveyQuestions = this.pouchService.surveyQuestions;
  }

  ngOnInit() {
  }

  // segmentChanged(e) {
  //   console.info(e.value.);
  // }


}
