import {Injectable} from "@angular/core";
import {HttpService} from "./httpService";
import {catchError, map} from "rxjs";
import {HttpErrorResponse} from "@angular/common/http";
import {isMessage} from "../models/Exceptions/ExceptionMessage";
import {Box, BoxRequest} from "../models/Boxes/Box";

@Injectable({
  providedIn: "root"
})
export class BoxesService {
  constructor(private http: HttpService) {
  }

  getAll() {
    return this.http.getBoxes().pipe(
      map(res => isMessage(res) ? [] : res as Box[]),
      catchError((error: HttpErrorResponse) => {
        throw new Error(error.error?.message ?? "Can't load boxes");
      })
    );
  }

  create(data: BoxRequest) {
    return this.http.createBox(data).pipe(
      map(res => res as Box),
      catchError((error: HttpErrorResponse) => {
        throw new Error(error.error?.message ?? "Can't create box");
      })
    );
  }

  edit(data: BoxRequest) {
    return this.http.editBox(data).pipe(
      map(res => res as Box),
      catchError((error: HttpErrorResponse) => {
        throw new Error(error.error?.message ?? "Can't edit box");
      })
    );
  }

  delete(id: number) {
    return this.http.deleteBox(id).pipe(
      map(res => res as number),
      catchError((error: HttpErrorResponse) => {
        throw new Error(error.error?.message ?? "Can't delete box");
      })
    );
  }
}
