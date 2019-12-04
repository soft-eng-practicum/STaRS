import { Injectable } from '@angular/core';
import PouchDB from 'pouchdb';

// need to fetch password for databases from the local json file
// stars2019 has all the data for the posters
// judges_sp18 has all the data for the judges and the poster they created

@Injectable({
  providedIn: 'root'
})
export class PouchService {
  pouchJudges: any;
  pouchPosters: any;
  globalUser: any;
  globalUserDoc: any;
  posters: any = [];
  password: any = [];
  surveyQuestions: any = [];

  constructor() {
    // this fetches the database password from the local json file
    fetch('./assets/data/couch_connection.json')
      .then(res => res.json())
      .then(json => {
        this.password = json;
      });

    // this fetches the survey question list from the local json file
    fetch('./assets/data/survey.json')
      .then(res => res.json())
      .then(json => {
        this.surveyQuestions = json;
      });
  }

  /**
   * This method returns a promise of all the judges from the database
   */
  getAllJudgesPromise() {
    console.log('JUDGES LOADED');
    this.pouchJudges = new PouchDB(
      this.password.couchConnection + '/judges_sp18'
    );
    return this.pouchJudges.allDocs({
      include_docs: true,
      attachments: true
    });
  }

  /**
   * This method returns the judge based on the parameter
   * @param id
   */
  updateJudgeSurveys(id: string) {
    return this.pouchJudges.get(id);
  }

  /**
   * This method returns all of the posters (CSV Format) into JSON
   * and stores them in the posters array
   */
  getAllPosters() {
    console.log('POSTERS LOADED');
    this.pouchPosters = new PouchDB(
      this.password.couchConnection + '/stars2019'
    );
    return this.pouchPosters
      .allDocs({
        include_docs: true,
        attachments: true
      })
      .then(result => {
        for (const i of result.rows) {
          const posterRows = i.doc.posters.split(/\n/);
          const posterTitles = posterRows.shift().split(/,/);
          let posterIndex = 0;
          posterRows.forEach(row => {
            const rowList = row.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g);
            this.posters[posterIndex] = {
              email: rowList[0],
              id: rowList[1],
              judges: [],
              countJudges: 0,
              group: rowList[2],
              subject: rowList[3],
              students: rowList[4].replace(/\"/g, ''),
              advisor: rowList[5].replace(/\"/g, ''),
              advisorEmail: rowList[6]
            };
            posterIndex++;
          });
        }
      });
  }

  /**
   * This method takes in the poster id and will return the poster object
   * that will be used to bind the poster judging view
   * @param id
   */
  getPoster(id: string) {
    return {
      ...this.posters.find(poster => {
        return poster.id === id;
      })
    };
  }

  /**
   * This method will filter the posters based on the subject
   * @param searchTerm
   */
  filterItems(searchTerm) {
    return this.posters.filter(item => {
      return (
        item.subject
          .toLowerCase()
          .indexOf(searchTerm.toString().toLowerCase()) > -1
      );
    });
  }
}
