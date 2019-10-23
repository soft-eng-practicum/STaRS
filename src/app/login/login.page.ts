import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  username;
  password;

  constructor(public alertController: AlertController, private  router: Router) { }

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
    if (this.username === 'polaris' && this.password === 'ggc') {
      this.router.navigateByUrl('/home/tabs/tab1');
    } else {
      this.presentAlert();
    }
  }

}
