import {inject, Injectable} from "@angular/core";
import {entityStorage} from "../_helpers/storage/entityStorage";
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {HttpService} from "./httpService";
import {catchError, map, Observable, of} from "rxjs";
import {Position} from "../models/Positions/Position";
import {ExceptionMessage, isMessage} from "../models/Exceptions/ExceptionMessage";
import {IngredientAmount} from "../models/Positions/IngredientAmount";
import {getXHRResponse} from "rxjs/internal/ajax/getXHRResponse";

@Injectable({
  providedIn: 'root'
})

export class PositionsService {
  public store = inject(entityStorage);

  constructor(private http: HttpService) {

  }

  public getByCategory(categoryId:number=0):Observable<Position[] | ExceptionMessage>{
    return this.http.getAllPositionsByCategoryId(categoryId).pipe(
      map((res:Position[] | ExceptionMessage)=>{
        if(!isMessage(res)){
          this.store.addPositions(res as Position[]);
        }
        return res as Position[];
      }),
      catchError((error:HttpErrorResponse)=>{
        let msg = new ExceptionMessage(error.error.message, error.error.status);
        return of(msg);
      })
    )
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

  public addPosition(formData:FormData):Observable<Position | ExceptionMessage>{
    return this.http.addPosition(formData).pipe(
      map((response:Position | ExceptionMessage)=>{
        this.store.addPosition(response as Position);
        return response as Position;
      }),
      catchError((error:HttpErrorResponse)=>{
        let msg = new ExceptionMessage(error.error.message, error.error.status);
        return of(msg);
      })
    )
  }

  removePosition(id: number) {
    return this.http.removePosition(id).pipe(
      map((response:number | ExceptionMessage) => {
        this.store.removePosition(id);
        return response as number;
      }),
      catchError((error:HttpErrorResponse)=>{
        let msg = new ExceptionMessage(error.error.message, error.error.status);
        return of(msg);
      })
    )
  }
}
