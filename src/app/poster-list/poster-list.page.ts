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
export class PosterListPage {
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

    // this will create a copy of the local JSON's survey questons
    this.surveyQuestions = JSON.parse(
      JSON.stringify(this.pouchService.surveyQuestions)
    );

    // this will set the local model based on the object (poster) clicked
    this.activatedRoute.paramMap.subscribe(paramMap => {
      if (!paramMap.has('id')) {
        return;
      }
      const posterId = paramMap.get('id');
      this.loadedPoster = this.pouchService.getPoster(posterId);
    });
  }

  /**
   * This method will trigger an alert displaying information about the question
   * @param index
   */
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

  /**
   * This method will show the judges that have voted on the specific poster
   * @TODO need to display judges that have voted on that specific poster
   */
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

  /**
   * This method will store all of the survey answers in two arrays.
   * The surveyAnswers array will hold the answers only which are used to
   * be sent to the database. The surveyQuestions array is used just to display
   * the wordValue to the user so everytime a number is clicked, it will change
   * the value of wordValue in that array.
   * @param event
   * @param index
   */
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

  /**
   * This method will submit the users survey if they have filled out
   * all of the required fields
   * @TODO Need to make the text field optional
   */
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

      /**
       * This will use the promise returned from the pouch.service.ts and will grab
       * the doc returned from it. Once you have the doc, you will be able to push
       * the survey answers to it. Once the doc has been pushed to, you will need
       * to put (update) the doc to the database.
       */
      this.pouchService
        .updateJudgeSurveys(this.pouchService.globalUserDoc._id)
        .then(doc => {
          console.log('THE DOC' + doc);
          console.log(doc);
          const push = {
            answers: this.surveyAnswers,
            groupName: this.loadedPoster.group,
            groupId: this.loadedPoster.id,
            advisor: this.loadedPoster.advisor,
            students: this.loadedPoster.students
          };
          console.log(doc.surveys);
          doc.surveys.push(push);
          // this splice method is used to remove all but one survey from the user (just for demo purpose)
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
