import { Injectable } from '@angular/core';
import PouchDB from 'pouchdb';

// fetch password for start2019
// stars2019 has all the data for the posters
// judges_sp18 has all the data for the judges and the poster they created

@Injectable({
  providedIn: 'root'
})
export class PouchService {
  private db: any;
  constructor() {
  }

  info() {
    console.log("lol");
    this.db = new PouchDB('http://admin:starsGGCadmin@itec-gunay.duckdns.org:5984/judges_sp18');
    // console.log(this.db.info().then(info => {
    //   console.log(info);
    // }));
    console.log(this.db.allDocs({
      include_docs: true,
      attachments: true
    }).then(result => {
      console.log(result);
    }).catch(err => {
      console.log(err);
    }));
   }
}
