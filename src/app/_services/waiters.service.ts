import {Injectable} from "@angular/core";
import {HttpService} from "./httpService";
import {catchError, map} from "rxjs";
import {HttpErrorResponse} from "@angular/common/http";
import {isMessage} from "../models/Exceptions/ExceptionMessage";
import {Waiter, WaiterRequest} from "../models/Waiters/Waiter";

@Injectable({
  providedIn: "root"
})
export class WaitersService {
  constructor(private http: HttpService) {
  }

  getAll() {
    return this.http.getWaiters().pipe(
      map(res => isMessage(res) ? [] : res as Waiter[]),
      catchError((error: HttpErrorResponse) => {
        throw new Error(error.error?.message ?? "Can't load waiters");
      })
    );
  }

  create(name: string) {
    return this.http.createWaiter({name}).pipe(
      map(res => res as Waiter),
      catchError((error: HttpErrorResponse) => {
        throw new Error(error.error?.message ?? "Can't create waiter");
      })
    );
  }

  edit(data: WaiterRequest) {
    return this.http.editWaiter(data).pipe(
      map(res => res as Waiter),
      catchError((error: HttpErrorResponse) => {
        throw new Error(error.error?.message ?? "Can't edit waiter");
      })
    );
  }

  delete(id: number) {
    return this.http.deleteWaiter(id).pipe(
      map(res => res as number),
      catchError((error: HttpErrorResponse) => {
        throw new Error(error.error?.message ?? "Can't delete waiter");
      })
    );
  }
}
