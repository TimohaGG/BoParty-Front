import {inject, Injectable} from "@angular/core";
import {entityStorage} from "../_helpers/storage/entityStorage";
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {HttpService} from "./httpService";
import {catchError, map, Observable, of} from "rxjs";
import {Position} from "../models/Positions/Position";
import {ExceptionMessage, isMessage} from "../models/Exceptions/ExceptionMessage";

@Injectable({
  providedIn: 'root'
})

export class PositionsService {
  public store = inject(entityStorage);

  constructor(private http: HttpService) {

  }

  public getAll():Observable<Position[] | ExceptionMessage> {
    return this.http.getAllPositions().pipe(
      map((response:Position[] | ExceptionMessage) => {
        if(!isMessage(response)){
          this.store.setAllPositions(response as Position[]);
        }
        return response as Position[];
      }),
      catchError((error:HttpErrorResponse)=>{
        let msg = new ExceptionMessage(error.error.message, error.error.status);
        return of(msg);
      })
    );
  }
}
