import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { map, catchError } from 'rxjs/operators';
import * as socketIo from 'socket.io-client';
import { Stock } from '../stocks/stock.model';
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";

import { Socket } from '../shared/interfaces';
import { environment } from '../../environments/environment';
import { Subject } from 'rxjs/Subject';

const ENV_URL = environment.envUrl

declare var io : {
  connect(url: string): Socket;
};

@Injectable({
  providedIn: 'root'
})
export class DataService {

  private stocks: Stock[] = [];
  private stocksUpdated = new Subject<{ stocks: Stock[] }>();

  socket: Socket;
  observer: Observer<object>;

  constructor(private http: HttpClient, private router: Router) {}

  startTimer() : Observable<object> {
    this.socket = socketIo(ENV_URL);

    this.socket.on('data', (res) => {
      this.observer.next(res.data);
    });

    return this.createObservable();
  }

  getStocks() : Observable<object> {
    this.startTimer().pipe(
        map(stockData => {
          return {
            stocks: stockData[0]
          }
        })
      )
      .subscribe(transformedData => {
        this.stocks = transformedData.stocks;
        this.stocksUpdated.next({
          stocks: [...this.stocks]
        });
      });
    return this.createObservable();
  }

  getStockUpdateListener() {
    return this.stocksUpdated.asObservable();
  }

  createObservable() : Observable<object> {
      return new Observable<object>(observer => {
        this.observer = observer;
      });
  }

  private handleError(error) {
    console.error('server error:', error);
    if (error.error instanceof Error) {
        let errMessage = error.error.message;
        return Observable.throw(errMessage);
    }
    return Observable.throw(error || 'Socket.io server error');
  }

}
