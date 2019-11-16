import { Component, OnInit } from '@angular/core';
import { PouchService } from 'src/app/pouch.service';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page implements OnInit {
  currentUser: any;
  poster: any = [];
  items: any = [];
  searchTerm: string;
  constructor(private pouchService: PouchService) {
    this.currentUser = this.pouchService.globalUser;
    this.pouchService.getAllPosters();
    this.poster = this.pouchService.posters;
    this.items = this.pouchService.posters;
    console.log(this.poster);
  }

    filterItems(searchTerm) {
    return this.items.filter(item => {
      return (
        item.group.toLowerCase().indexOf(searchTerm.toString().toLowerCase()) >
        -1
      );
    });
  }

  ngOnInit() {
  }

  onChangeHandler($event) {
    if ($event.target.value === 'all') {
      return this.poster = this.pouchService.posters;
    } else {
      this.poster.subject = $event.target.value;
      this.poster = this.pouchService.filterItems(this.poster.subject);
    }
  }
    setFilteredItems() {
    return this.poster = this.filterItems(this.searchTerm);
  }
}
