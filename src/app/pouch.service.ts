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
  constructor() {
    fetch('./assets/data/couch_connection.json')
    .then(res => res.json())
    .then(json => {
      // console.log(json);
      this.password = json;
      console.log(this.password.couchConnection);
    });
  }

  getAllJudges() {
    console.log("JUDGES LOADED");
    this.pouchJudges = new PouchDB(this.password.couchConnection + '/judges_sp18');
    // console.log(this.db.info().then(info => {
    //   console.log(info);
    // }));
    // console.log(this.db.allDocs({
    //   include_docs: true,
    //   attachments: true
    // }).then(result => {
    //   console.log(result);
    // }).catch(err => {
    //   console.log(err);
    // }));
    return this.pouchJudges.allDocs({
      include_docs: true,
      attachments: true
    });
   }
   getAllPosters() {
    console.log("POSTERS LOADED");
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
              students: rowList[4],
              advisor: rowList[5],
              advisorEmail: rowList[6]
          };
          posterIndex++;
      });
        // console.log(this.posters);
      }
    });
  }
}
