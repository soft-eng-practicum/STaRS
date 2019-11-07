import { Component } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage {

  constructor(public alertController: AlertController, private  router: Router) {}

  async logout() {
    const alert = await this.alertController.create({
      // header: 'Alert',
      // subHeader: 'Subtitle',
      message: 'Are you sure you want to logout?',
      cssClass: 'alert-box',
      buttons: [ {
        text: 'LOGOUT',
        cssClass: 'icon-color',
        handler: () => {
          this.router.navigateByUrl('');
        }
      },
      {
        text: 'CANCEL',
        cssClass: 'icon-color'
      }]
    });
    await alert.present();
  }
  
}
