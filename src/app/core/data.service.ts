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

const ENV_URL = environment.apiUrl + '/api'

declare var io : {
  connect(url: string): Socket;
};

@Injectable()
export class DataService {

  private stocks: Stock[] = [];
  private stocksUpdated = new Subject<{ stocks: Stock[] }>();

  socket: Socket;
  observer: Observer<object>;

  constructor(private http: HttpClient, private router: Router) {}

  startTimer() : Observable<object> {
    this.socket = socketIo('http://localhost:8080');

    this.socket.on('data', (res) => {
      this.observer.next(res.data);
    });

    return this.createObservable();
  }

  getStocks(selectedValue: string) : Observable<object> {
    const queryParams = `?pageOptions=${selectedValue}`;
    if (selectedValue !== 'live') {
      this.http.get<{stocks: any}>(
        ENV_URL + queryParams
      ).pipe(
        map(stockData => {
          return {
            stocks: stockData.stocks.map(stock => {
              return {
                open: stock.open,
                high: stock.high,
                low: stock.low,
                close: stock.close,
                volume: stock.volume
              }
            })
          }
        })
      ).subscribe(transformedData => {
        this.stocks = transformedData.stocks;
        this.stocksUpdated.next({
          stocks: [...this.stocks]
        });
        console.log(this.stocks)
      });
    } else {
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
    }

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
