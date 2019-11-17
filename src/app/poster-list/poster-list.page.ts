import { Component, OnInit } from '@angular/core';
import { PouchService } from 'src/app/pouch.service';
import { AlertController } from '@ionic/angular';


@Component({
  selector: 'app-poster-list',
  templateUrl: './poster-list.page.html',
  styleUrls: ['./poster-list.page.scss'],
})
export class PosterListPage implements OnInit {

  constructor(private pouchService: PouchService, public alertController: AlertController) {
    this.currentUser = this.pouchService.globalUser;
    this.surveyQuestions = this.pouchService.surveyQuestions;
  }

  currentUser: any;
  surveyQuestions: any = [];
  controller: any;
  question: any = [];
  selectRadioGroup: any;
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

  radioSelect(event){
    this.selectRadioGroup = event.detail.value;
    console.log(this.selectRadioGroup);
  }
}
