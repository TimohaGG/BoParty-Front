import {inject, Injectable} from "@angular/core";
import {HttpService} from "./httpService";
import {entityStorage} from "../_helpers/storage/entityStorage";
import {catchError, map, Observable, of} from "rxjs";
import {Category} from "../models/Positions/Category";
import {ExceptionMessage, isMessage} from "../models/Exceptions/ExceptionMessage";
import {HttpErrorResponse} from "@angular/common/http";
import {StorageService} from "./storage.service";

@Injectable({providedIn: 'root'})

export class PositionsCategoryService {
  private store = inject(entityStorage);

  constructor(private http: HttpService, private userStorage:StorageService) {

  }

  public getAll():Observable<Category[] | ExceptionMessage> {

    console.log("GetAll");
    return this.http.getAllCategories(this.userStorage.getUserId()).pipe(
      map((response:Category[] | ExceptionMessage) => {
        console.log(response);
        if (!isMessage(response)) {
          this.store.setAllPositionCategories(response as Category[]);
        }
        return response as Category[];
      }),
      catchError((error:HttpErrorResponse)=>{
        let msg = new ExceptionMessage(error.error.message, error.error.status);
        throw new Error(error.error.message)

      })
    );
  }

  addCategory(result: string):Observable<Category | ExceptionMessage> {
    console.log("Adding category");
    return this.http.addPositionCategory(this.userStorage.getUserId(), result).pipe(
      map((response:Category | ExceptionMessage) => {
        if(!isMessage(response)) {
          this.store.addPositionCategory(response as Category);
        }
        return response as Category;
      }),
      catchError((error:HttpErrorResponse)=>{
        console.log(error);
        let msg = new ExceptionMessage(error.error.message, error.error.status);
        return of(msg);
      })
    );
  }
}
