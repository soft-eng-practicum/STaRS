import { Component, OnInit } from '@angular/core';
import { AppService } from 'src/app/app.service';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page implements OnInit {
  poster: any = [];
  items: any = [];
  searchTerm: string;
  constructor(private appService: AppService) { }

  ngOnInit() {
    fetch('./assets/data/poster.json')
      .then(res => res.json())
      .then(json => {
        this.poster = json;
        this.items = this.poster;
      });
  }
  onChangeHandler($event) {
    if ($event.target.value === 'all') {
      return fetch('./assets/data/poster.json')
        .then(res => res.json())
        .then(json => {
          this.poster = json;
        });
    } else {
      this.poster.subject = $event.target.value;
      this.poster = this.appService.filterItems(this.poster.subject);
    }
  }
  filterItems(searchTerm) {
    return this.items.filter(item => {
      return (
        item.group.toLowerCase().indexOf(searchTerm.toString().toLowerCase()) >
        -1
      );
    });
  }
  setFilteredItems() {
    return this.poster = this.filterItems(this.searchTerm);
  }
}
