import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { PouchService } from 'src/app/pouch.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  username: any;
  password: any;
  userDoc: any;

  constructor(public alertController: AlertController, private  router: Router, private pouchService: PouchService) { }

  async presentAlert() {
    const alert = await this.alertController.create({
      // header: 'Alert',
      // subHeader: 'Subtitle',
      cssClass: 'alert-box',
      message: 'Please enter valid login credentials.',
      buttons: [ {
        text: 'OK',
        cssClass: 'icon-color'
      }]
    });
    await alert.present();
  }

  ngOnInit() {
  }

  loginUser(event) {
    // event.preventDefault();
    // const target = event.target;
    // // console.log(target);
    // const username = target.querySelector('#username').value;
    // const password = target.querySelector('#password').value;
    // console.log(username, password);
    // if (this.username === 'polaris' && this.password === 'ggc') {
    //   this.router.navigateByUrl('/home/tabs/tab1');
    // } else {
    //   this.presentAlert();
    // }

    // let check;
    // let posterIndex = 0;
    this.pouchService.getAllJudgesPromise().then(result => {
      for (const i of result.rows) {
        // this.judges[posterIndex] = i;
        // posterIndex++;
        if (this.username === i.doc.username && this.password === i.doc.password) {
            this.userDoc = i.doc;
          }
      }
      // console.log(this.userDoc);
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
