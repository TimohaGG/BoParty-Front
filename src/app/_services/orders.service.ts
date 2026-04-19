import {computed, inject, Injectable, Signal} from "@angular/core";
import {HttpService} from "./httpService";
import {entityStorage} from "../_helpers/storage/entityStorage";
import {MinMenu} from "../models/Menu/MinMenu";
import {ExceptionMessage, isMessage} from "../models/Exceptions/ExceptionMessage";
import {catchError, map, Observable, of, pipe, Subscription, throwError} from "rxjs";
import {HotToastService} from "@ngxpert/hot-toast";
import {HttpErrorResponse} from "@angular/common/http";
import {Menu} from "../models/Menu/Menu";
import {MinPosAmount} from "../models/Positions/MinPosAmount";
import {CommonMenuInfo} from "../models/Menu/CommonMenuInfo";
import {AdditionalMenuData} from "../models/Menu/AdditionalMenuData";

@Injectable({
  providedIn:"root"
})

export class OrdersService{
  public store = inject(entityStorage);

  constructor(private http:HttpService, private toast:HotToastService) {
  }

  public getAll():Observable<Menu[] | ExceptionMessage> {
    return this.http.getAllOrders().pipe(
      map(res=>{
        if(!isMessage(res)){
          this.store.setAllOrders(res as Menu[]);
        }
        return res as Menu[];
      }),
      catchError((error:HttpErrorResponse)=>{
        let msg = new ExceptionMessage(error.error.message, error.error.status);
        return of(msg);
      })
    );
  }

  public getAllMin(){
    return this.http.getAllMinOrders().pipe(
      map(res=>{
        if(!isMessage(res)){
          this.store.setAllMinOrders(res as MinMenu[]);
        }
      }),
      catchError((error:HttpErrorResponse)=>{
        throw new Error(error.error.message);
      })
    )
  }


  saveOrder(data:any, positions:MinPosAmount[], additionalData:AdditionalMenuData[]):Observable<Menu | ExceptionMessage> {
    console.log(data);
    return this.http.addOrder(data, positions,additionalData).pipe(
      map(res=>{
        this.store.setOrder(res as Menu);
        return res as Menu;
      }),
      catchError((error:HttpErrorResponse)=>{
        throw new Error(error.error.message);
      })
    )
  }

  getById(editOrderid: number) {
    let order = this.store.menusEntities().findIndex(order=>order.id==editOrderid);
    if(order!=-1) {
      return of(this.store.menusEntities().at(order)!);
    }
    else{
      console.log("sending request ")
      return this.http.getOrderById(editOrderid).pipe(
        map(res=>{
          this.store.addOrder(res as Menu);
          console.log("Got data",res);
          return res as Menu;
        }),
        catchError((error:HttpErrorResponse)=>{
          console.log(error);
          let msg = new ExceptionMessage(error.error.message, error.error.status);
          return of(msg);
        })
      );

    }
  }

  editOrder(id:number, value:any, items: MinPosAmount[], additionalInfo:AdditionalMenuData[]) {
    return this.http.editOrder(id, value,items,additionalInfo).pipe(
      map(res=>{
        let order = res as Menu;
        this.store.setOrder(order);
        return order;
      }),
      catchError((error:HttpErrorResponse)=>{
        throw new Error(error.error.message);
      })
    );
  }

  saveCommonInfo(res: any) {
    return this.http.addCommonOrderInfo(res).pipe(
      map(res=>{
        let info = res as CommonMenuInfo;
        this.store.setCommonData(res as CommonMenuInfo);
        return info;
      }),
      catchError((error:HttpErrorResponse)=>{
        throw new Error(error.error.message());
      })

    )
  }

  getAllCommonData() {
    return this.http.addAllCommonInfo().pipe(
      map(res=>{
        if(!isMessage(res)){
          this.store.setAllCommonData(res as CommonMenuInfo[]);
        }
      }),
      catchError((error:HttpErrorResponse)=>{
        throw new Error(error.error.message);
      })
    );
  }

  deleteOrder(id: number) {
    return this.http.deleteOrder(id).pipe(
      map(res=>{
        if(!isMessage(res)){
          this.store.removeOrder(res as number);
        }
      }),
      catchError((err:HttpErrorResponse)=>{
        throw new Error(err.error.message);
      })
    );

  }

  togglePayed(id: number, isPayed: boolean) {
    this.getById(id).subscribe(res=>{
      if(!isMessage(res)){
        let data:Menu = (res as Menu);
        console.log("from ", data.payed, "to ", isPayed);
        data.payed = isPayed;
        this.store.addOrder(data);
        this.http.toggleStatus(data.id, data.payed).subscribe(res=>{
        });
      }
    });

  }
}
