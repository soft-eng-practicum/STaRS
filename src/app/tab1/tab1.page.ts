import { Component } from '@angular/core';
import { PouchService } from 'src/app/pouch.service';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {

  currentUser: any;
  currentUserSurveys: any;
  posters: any = [];

  constructor(private pouchService: PouchService, public alertController: AlertController) {
    this.currentUser = this.pouchService.globalUser;
    this.currentUserSurveys = this.pouchService.globalUserDoc.surveys;
    console.log(this.currentUserSurveys);
    this.pouchService.getAllPosters();
    // this.posters = this.pouchService.posters;
    // debugger;
    // console.log(this.posters);
  }

  doRefresh(event) {
    console.log('Begin async operation');
    this.currentUserSurveys = this.pouchService.globalUserDoc.surveys;
    console.log(this.currentUserSurveys);
    setTimeout(() => {
      console.log('Async operation has ended');
      event.target.complete();
    }, 2000);
  }

  async test() {
    const alert = await this.alertController.create({
      // header: 'Alert',
      // subHeader: 'Subtitle',
      cssClass: 'alert-box',
      message: 'Please pull the page down to refresh completed surveys.',
      buttons: [ {
        text: 'OK',
        cssClass: 'icon-color'
      }]
    });
    await alert.present();
  }
}
