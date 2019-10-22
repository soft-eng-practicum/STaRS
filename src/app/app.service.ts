import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AppService {
  poster: any = [];
  searchTerm: string;
  constructor() {
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
