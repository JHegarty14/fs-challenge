import { Component, OnInit, OnDestroy } from '@angular/core';
import { DataService } from './core/data.service';
import { Subscription } from 'rxjs/Subscription';
import { map } from "rxjs/operators";

import { environment } from '../environments/environment'
import { Stock } from './stocks/stock.model';
import { Subject } from 'rxjs';
import { Observable } from "rxjs/Rx";
import 'rxjs/add/observable/fromEvent';

export interface Option {
  value: string,
  viewValue: string
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  
  isLoading = false;
  pageOptions: Option[] = [
    { value: 'live', viewValue: 'Live' },
    { value: 'one', viewValue: 'Past Week' }, 
    { value: 'two', viewValue: 'Past Two Weeks' }
  ];
  private oneWeek: Stock[] = [];
  private twoWeeks: Stock[] = [];
  private stocks: Stock[] = [];
  
  private sub: Subscription;
  private timerSubscription: Subscription;
  selectedValue: string;

  constructor(private dataService: DataService) { }

  ngOnInit() {
    this.selectedValue = 'live'
    this.refreshData();
  }

  private refreshData(): void {
      this.sub = this.dataService.getStocks(this.selectedValue)
        .subscribe(stocks => {
        for (var x in stocks) {
          stocks.hasOwnProperty(x) && this.stocks.push(stocks[x])
        }
        if (this.stocks.length !== 6) {
          this.stocks.splice(0, 6);
        }
        console.log(this.stocks);
          this.subscribeToData();
      });
}

private subscribeToData(): void {
    this.timerSubscription = Observable.timer(6000).first()
      .subscribe(() => this.refreshData());
}

  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }

    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }
}
