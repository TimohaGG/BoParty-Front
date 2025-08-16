import {computed, inject, Injectable, Signal} from "@angular/core";
import {HttpService} from "./httpService";
import {entityStorage} from "../_helpers/storage/entityStorage";
import {MinOrder} from "../models/Orders/MinOrder";
import {ExceptionMessage, isMessage} from "../models/Exceptions/ExceptionMessage";
import {catchError, map, Observable, of, pipe, Subscription, throwError} from "rxjs";
import {HotToastService} from "@ngxpert/hot-toast";
import {HttpErrorResponse} from "@angular/common/http";
import {Order} from "../models/Orders/Order";
import {MinPosAmount} from "../models/Positions/MinPosAmount";

@Injectable({
  providedIn:"root"
})

export class OrdersService{
  public store = inject(entityStorage);

  constructor(private http:HttpService, private toast:HotToastService) {
  }

  public getAll():Observable<Order[] | ExceptionMessage> {
    return this.http.getAllOrders().pipe(
      map(res=>{
        if(!isMessage(res)){
          this.store.setAllOrders(res as Order[]);
        }
        return res as Order[];
      }),
      catchError((error:HttpErrorResponse)=>{
        let msg = new ExceptionMessage(error.error.message, error.error.status);
        return of(msg);
      })
    );
  }


  saveOrder(data:any, positions:MinPosAmount[]):Observable<Order | ExceptionMessage> {
    console.log(data);
    return this.http.addOrder(data, positions).pipe(
      map(res=>{
        this.store.setOrder(res as Order);
        return res as Order;
      }),
      catchError((error:HttpErrorResponse)=>{
        throw new Error(error.error.message);
      })
    )
  }

  getById(editOrderid: number) {
    let order = this.store.ordersEntities().findIndex(order=>order.id==editOrderid);
    if(order!=-1) {
      return of(this.store.ordersEntities().at(order)!);
    }
    else{
      console.log("sending request ")
      return this.http.getOrderById(editOrderid).pipe(
        map(res=>{
          this.store.addOrder(res as Order);
          console.log("Got data",res);
          return res as Order;
        }),
        catchError((error:HttpErrorResponse)=>{
          console.log(error);
          let msg = new ExceptionMessage(error.error.message, error.error.status);
          return of(msg);
        })
      );

    }
  }

  editOrder(id:number, value:any, items: MinPosAmount[]) {
    return this.http.editOrder(id, value,items).pipe(
      map(res=>{
        let order = res as Order;
        this.store.setOrder(order);
        return order;
      }),
      catchError((error:HttpErrorResponse)=>{
        throw new Error(error.error.message);
      })
    );
  }
}
