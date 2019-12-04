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
    this.pouchService.getAllPosters();
  }

  /**
   * This method will refresh the survyes when pulling down
   * on the home page
   * @param event
   */
  doRefresh(event) {
    console.log('Begin async operation');
    this.currentUserSurveys = this.pouchService.globalUserDoc.surveys;
    console.log(this.currentUserSurveys);
    setTimeout(() => {
      console.log('Async operation has ended');
      event.target.complete();
    }, 2000);
  }

  /**
   * This method will trigger an alert to tell the user
   * how to refresh the page to update their survyes
   */
  async helpRefresh() {
    const alert = await this.alertController.create({
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
