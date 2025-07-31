import {computed, inject, Injectable, Signal} from "@angular/core";
import {HttpService} from "./httpService";
import {entityStorage} from "../_helpers/storage/entityStorage";
import {MinOrder} from "../models/Orders/MinOrder";
import {ExceptionMessage, isMessage} from "../models/Exceptions/ExceptionMessage";
import {catchError, map, Observable, of, pipe, Subscription, throwError} from "rxjs";
import {HotToastService} from "@ngxpert/hot-toast";
import {HttpErrorResponse} from "@angular/common/http";

@Injectable({
  providedIn:"root"
})

export class OrdersService{
  public store = inject(entityStorage);

  constructor(private http:HttpService, private toast:HotToastService) {
  }

  public getAll():Observable<MinOrder[] | ExceptionMessage> {
    return this.http.getAllOrders().pipe(
      map(res=>{
        if(!isMessage(res)){
          this.store.setAllMinOrders(res as MinOrder[]);
        }
        return res as MinOrder[];

      }),
      catchError((error:HttpErrorResponse)=>{
        let msg = new ExceptionMessage(error.error.message, error.error.status);
        return of(msg);
      })
    );
  }


}
