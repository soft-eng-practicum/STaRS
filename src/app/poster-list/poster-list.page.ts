import { Component, OnInit } from '@angular/core';
import { PouchService } from 'src/app/pouch.service';
import { AlertController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-poster-list',
  templateUrl: './poster-list.page.html',
  styleUrls: ['./poster-list.page.scss']
})
export class PosterListPage implements OnInit {
  currentUser: any;
  surveyQuestions: any = [];
  controller: any;
  question: any = [];
  test: any;
  selectRadioGroup: any;
  loadedPoster: any;
  ratingToWord: any;
  temp: any;
  surveyAnswers: any = [];

  constructor(
    private pouchService: PouchService,
    public alertController: AlertController,
    private activatedRoute: ActivatedRoute,
    public loadingController: LoadingController,
    private router: Router,
    public toastController: ToastController
  ) {
    this.currentUser = this.pouchService.globalUser;
    // this.surveyQuestions = this.pouchService.getSurveys();
    this.surveyQuestions = JSON.parse(
      JSON.stringify(this.pouchService.surveyQuestions)
    );
    this.activatedRoute.paramMap.subscribe(paramMap => {
      if (!paramMap.has('id')) {
        return;
      }
      const posterId = paramMap.get('id');
      this.loadedPoster = this.pouchService.getPoster(posterId);
    });
  }

  ngOnInit() {}

  async showInfo(index) {
    this.question = this.surveyQuestions[index - 1];
    const alert = await this.alertController.create({
      header: this.question.information,
      subHeader: this.question.additional,
      buttons: [
        {
          text: 'OK',
          cssClass: 'icon-color'
        }
      ]
    });
    await alert.present();
  }

  async showJudges() {
    if (this.loadedPoster.judges.length === 0) {
      const alert = await this.alertController.create({
        header: 'Judges who have surveyed:',
        subHeader: 'This poster has not been surveyed yet.',
        buttons: [
          {
            text: 'OK',
            cssClass: 'icon-color'
          }
        ]
      });
      await alert.present();
    } else {
      const alert = await this.alertController.create({
        header: 'Judges who have surveyed:',
        subHeader: this.loadedPoster.judges,
        buttons: [
          {
            text: 'OK',
            cssClass: 'icon-color'
          }
        ]
      });
      await alert.present();
    }
  }

  radioSelect(event, index) {
    const inputValue = event.detail.value;
    this.surveyQuestions[index - 1].value = inputValue;
    this.surveyAnswers[index - 1] = inputValue;
    switch (inputValue) {
      case '1':
        this.surveyQuestions[index - 1].wordValue = 'Below Average';
        break;
      case '2':
        this.surveyQuestions[index - 1].wordValue = 'Average';
        break;
      case '3':
        this.surveyQuestions[index - 1].wordValue = 'Good';
        break;
      case '4':
        this.surveyQuestions[index - 1].wordValue = 'Excellent';
        break;
      case '5':
        this.surveyQuestions[index - 1].wordValue = 'Outstanding';
        break;
      default:
        this.surveyQuestions[index - 1].wordValue = '';
    }
    console.log(this.selectRadioGroup);
  }

  async onSubmit() {
    if (this.surveyAnswers.length < 7) {
      const alert = await this.alertController.create({
        // header: 'Alert',
        // subHeader: 'Subtitle',
        cssClass: 'alert-box',
        message: 'Please complete all of the survey questions.',
        buttons: [
          {
            text: 'OK',
            cssClass: 'icon-color'
          }
        ]
      });
      await alert.present();
    } else {
      const loading = await this.loadingController.create({
        message: 'Please wait while your survey is submitted.',
        duration: 2000
      });
      await loading.present();
      const { role, data } = await loading.onDidDismiss();
      this.router.navigateByUrl('/home/tabs/tab2');

      const toast = await this.toastController.create({
        message: 'Your survey has been submitted!',
        duration: 2000
      });
      // debugger;
      this.pouchService
        .updateJudgeSurveys(this.pouchService.globalUserDoc._id)
        .then(doc => {
          console.log('THE DOC' + doc);
          console.log(doc);
          // doc.username = 'CREATE';
          const push = {
            answers: this.surveyAnswers,
            groupName: this.loadedPoster.group,
            groupId: this.loadedPoster.id,
            advisor: this.loadedPoster.advisor,
            students: this.loadedPoster.students
          };
          console.log(doc.surveys);
          doc.surveys.push(push);
          // console.log(doc.surveys);
          // debugger;
          // doc.surveys.splice(1, doc.surveys.length);
          this.pouchService.pouchJudges.put(doc);
          this.pouchService.globalUserDoc = doc;
          console.log(doc);
        })
        .catch(doc => {
          console.log('ERROR');
        });
      toast.present();
    }
  }
}
