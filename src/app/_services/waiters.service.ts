import {Injectable} from "@angular/core";
import {HttpService} from "./httpService";
import {catchError, map} from "rxjs";
import {HttpErrorResponse} from "@angular/common/http";
import {isMessage} from "../models/Exceptions/ExceptionMessage";
import {Staff, StaffRequest} from "../models/Waiters/Waiter";

@Injectable({
  providedIn: "root"
})
export class StaffService {
  constructor(private http: HttpService) {
  }

  getAll() {
    return this.http.getStaff().pipe(
      map(res => isMessage(res) ? [] : res as Staff[]),
      catchError((error: HttpErrorResponse) => {
        throw new Error(error.error?.message ?? "Can't load staff");
      })
    );
  }

  create(data: StaffRequest) {
    return this.http.createStaff(data).pipe(
      map(res => res as Staff),
      catchError((error: HttpErrorResponse) => {
        throw new Error(error.error?.message ?? "Can't create staff");
      })
    );
  }

  edit(data: StaffRequest) {
    return this.http.editStaff(data).pipe(
      map(res => res as Staff),
      catchError((error: HttpErrorResponse) => {
        throw new Error(error.error?.message ?? "Can't edit staff");
      })
    );
  }

  delete(id: number) {
    return this.http.deleteStaff(id).pipe(
      map(res => res as number),
      catchError((error: HttpErrorResponse) => {
        throw new Error(error.error?.message ?? "Can't delete staff");
      })
    );
  }
}
