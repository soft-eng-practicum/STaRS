import { Component, OnInit } from '@angular/core';
import { PouchService } from 'src/app/pouch.service';
import { AlertController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-poster-list',
  templateUrl: './poster-list.page.html',
  styleUrls: ['./poster-list.page.scss'],
})
export class PosterListPage implements OnInit {

  currentUser: any;
  surveyQuestions: any = [];
  controller: any;
  question: any = [];
  test: any;
  selectRadioGroup: any;
  loadedPoster: any;

  constructor(private pouchService: PouchService, public alertController: AlertController, private activatedRoute: ActivatedRoute) {
    this.currentUser = this.pouchService.globalUser;
    this.surveyQuestions = this.pouchService.surveyQuestions;
    this.activatedRoute.paramMap.subscribe(paramMap => {
      if (!paramMap.has('id')) {
        return;
      }
      const posterId = paramMap.get('id');
      this.loadedPoster = this.pouchService.getPoster(posterId);
    });
    // console.log(this.pouchService.getPoster('1'));
  }


  // segmentChanged(e) {
  //   console.info(e.value.);
  // }

  ngOnInit() {
  }

  async showAlert(index) {
    this.question = this.surveyQuestions[index - 1];
    const alert = await this.alertController.create({
      header: this.question.information,
      subHeader: this.question.additional,
      buttons: ['OK']
    });
    await alert.present();
  }

  radioSelect(event, index) {
    this.surveyQuestions[index - 1].value = event.detail.value;
    console.log(this.selectRadioGroup);
  }
}
