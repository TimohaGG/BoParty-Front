import {inject, Injectable} from "@angular/core";
import {HttpService} from "./httpService";
import {entityStorage} from "../_helpers/storage/entityStorage";
import {catchError, map, Observable, of} from "rxjs";
import {Category} from "../models/Positions/Category";
import {ExceptionMessage, isMessage} from "../models/Exceptions/ExceptionMessage";
import {HttpErrorResponse} from "@angular/common/http";

@Injectable({providedIn: 'root'})

export class PositionsCategoryService {
  private store = inject(entityStorage);

  constructor(private http: HttpService) {

  }

  public getAll():Observable<Category[] | ExceptionMessage> {
    return this.http.getAllCategories().pipe(
      map((response:Category[] | ExceptionMessage) => {
        if (!isMessage(response)) {
          this.store.setAllPositionCategories(response as Category[]);
        }
        return response as Category[];
      }),
      catchError((error:HttpErrorResponse)=>{
        let msg = new ExceptionMessage(error.error.message, error.error.status);
        return of(msg);
      })
    );
  }

}
