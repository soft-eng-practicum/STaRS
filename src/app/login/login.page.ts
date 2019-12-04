import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { PouchService } from 'src/app/pouch.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss']
})
export class LoginPage {
  username: any;
  password: any;
  userDoc: any;

  constructor(
    public alertController: AlertController,
    private router: Router,
    private pouchService: PouchService
  ) {}

  /**
   * This method will trigger an alert for the user when they
   * enter invalid login credentials
   */
  async presentAlert() {
    const alert = await this.alertController.create({
      cssClass: 'alert-box',
      message: 'Please enter valid login credentials.',
      buttons: [
        {
          text: 'OK',
          cssClass: 'icon-color'
        }
      ]
    });
    await alert.present();
  }

  /**
   * This method will check the users login credentials and
   * if successful it will log the user in
   * @param event
   */
  loginUser(event) {
    this.pouchService.getAllJudgesPromise().then(result => {
      for (const i of result.rows) {
        if (
          this.username === i.doc.username &&
          this.password === i.doc.password
        ) {
          this.userDoc = i.doc;
        }
      }
      if (this.userDoc === undefined) {
        this.presentAlert();
      } else {
        this.router.navigateByUrl('/home/tabs/tab1');
        this.pouchService.globalUser = this.username;
        this.pouchService.globalUserDoc = this.userDoc;
      }
    });
  }
}
