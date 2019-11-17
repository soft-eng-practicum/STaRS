import { Injectable } from '@angular/core';
import PouchDB from 'pouchdb';

// fetch password for start2019
// stars2019 has all the data for the posters
// judges_sp18 has all the data for the judges and the poster they created

@Injectable({
  providedIn: 'root'
})
export class PouchService {

  pouchJudges: any;
  pouchPosters: any;
  globalUser: any;
  posters: any = [];
  password: any = [];
  surveyQuestions: any = [];

  constructor() {
    fetch('./assets/data/couch_connection.json')
    .then(res => res.json())
    .then(json => {
      // console.log(json);
      this.password = json;
      console.log(this.password.couchConnection);
    });

    fetch('./assets/data/survey.json')
    .then(res => res.json())
    .then(json => {
      this.surveyQuestions = json;
    });
  }

  getAllJudges() {
    console.log('JUDGES LOADED');
    this.pouchJudges = new PouchDB(this.password.couchConnection + '/judges_sp18');
    return this.pouchJudges.allDocs({
      include_docs: true,
      attachments: true
    });
   }

   getAllPosters() {
    console.log('POSTERS LOADED');
    this.pouchPosters = new PouchDB(this.password.couchConnection + '/stars2019');
    return this.pouchPosters.allDocs({
      include_docs: true,
      attachments: true
    }).then(result => {
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
        // console.log(this.posters);
      }
    });
  }

  getPoster(id: string) {
    return {
      ...this.posters.find(poster => {
        return poster.id === id;
      })
    };
  }

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
