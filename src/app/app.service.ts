import { Injectable } from '@angular/core';
import { PouchService } from 'src/app/pouch.service';

@Injectable({
  providedIn: 'root'
})
export class AppService {
  poster: any = [];
  searchTerm: string;
  constructor() {
    console.log("tempzzz");
    fetch('./assets/data/poster.json')
      .then(res => res.json())
      .then(json => {
        this.poster = json;
      });
  }

  filterItems(searchTerm) {
    return this.poster.filter(item => {
      return (
        item.subject
          .toLowerCase()
          .indexOf(searchTerm.toString().toLowerCase()) > -1
      );
    });
  }
}
