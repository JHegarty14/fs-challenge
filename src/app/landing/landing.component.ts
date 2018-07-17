import { Component, OnInit, OnDestroy } from '@angular/core';
import { DataService } from '../core/data.service';
import { Subscription } from 'rxjs/Subscription';
import { map } from "rxjs/operators";

import { Stock } from '../stocks/stock.model';
import { AuthService } from '../auth/auth.service';
import { Subject } from 'rxjs';
import { Observable } from "rxjs/Rx";
import 'rxjs/add/observable/fromEvent';
import { Subscribable } from 'rxjs/Observable';

export interface Option {
  value: string,
  viewValue: string
}

@Component({
  selector: 'landing-component',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css']
})
export class LandingComponent implements OnInit, OnDestroy {
  
  isLoading = false;
  userIsAuthenticated = false;
  private stocks: Stock[] = [];
  /*pageOptions: Option[] = [
    { value: 'live', viewValue: 'Live' },
    { value: 'one', viewValue: 'Past Week' }, 
    { value: 'two', viewValue: 'Past Two Weeks' }
  ];
  private oneWeek: Stock[] = [];
  private twoWeeks: Stock[] = [];
  
  selectedValue: string; */
  
  private sub: Subscription;
  private timerSubscription: Subscription;
  private authStatusSub: Subscription;

  constructor(private dataService: DataService, private authService: AuthService) { }

  ngOnInit() {
    this.refreshData();
    this.userIsAuthenticated = this.authService.getIsAuth();
    this.authStatusSub = this.authService
      .getAuthStatusListener()
      .subscribe(isAuthenticated => {
        this.userIsAuthenticated = isAuthenticated;
      });
  }

  private refreshData(): void {
      this.sub = this.dataService.getStocks()
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
    this.timerSubscription = Observable.timer(1000).first()
      .subscribe(() => this.refreshData());
}

  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }

    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
    if (this.authStatusSub) {
      this.authStatusSub.unsubscribe();
    }
  }
}
