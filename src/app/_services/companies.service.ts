import {inject, Injectable} from "@angular/core";
import {catchError, map, Observable, of} from "rxjs";
import {HttpErrorResponse} from "@angular/common/http";
import {HttpService} from "./httpService";
import {Company} from "../models/Company/Company";
import {UserCompany} from "../models/Company/UserCompany";
import {ExceptionMessage} from "../models/Exceptions/ExceptionMessage";

@Injectable({providedIn: "root"})
export class CompaniesService {
  private readonly http = inject(HttpService);

  getAll(): Observable<Company[] | ExceptionMessage> {
    return this.http.getCompanies().pipe(
      map(response => response as Company[]),
      catchError((error: HttpErrorResponse) => of(new ExceptionMessage(error.error?.message ?? "Не вдалося завантажити компанії", error.error?.status)))
    );
  }

  create(name: string): Observable<Company | ExceptionMessage> {
    return this.http.createCompany(name).pipe(
      map(response => response as Company),
      catchError((error: HttpErrorResponse) => of(new ExceptionMessage(error.error?.message ?? "Не вдалося створити компанію", error.error?.status)))
    );
  }

  getUsers(): Observable<UserCompany[] | ExceptionMessage> {
    return this.http.getCompanyUsers().pipe(
      map(response => response as UserCompany[]),
      catchError((error: HttpErrorResponse) => of(new ExceptionMessage(error.error?.message ?? "Не вдалося завантажити користувачів", error.error?.status)))
    );
  }

  linkUser(userId: number, companyId: number | null): Observable<number | ExceptionMessage> {
    return this.http.linkUserCompany(userId, companyId).pipe(
      map(response => response as number),
      catchError((error: HttpErrorResponse) => of(new ExceptionMessage(error.error?.message ?? "Не вдалося змінити компанію користувача", error.error?.status)))
    );
  }

  setDefaultForPublic(companyId: number): Observable<Company | ExceptionMessage> {
    return this.http.setPublicCompany(companyId).pipe(
      map(response => response as Company),
      catchError((error: HttpErrorResponse) => of(new ExceptionMessage(error.error?.message ?? "Не вдалося змінити компанію", error.error?.status)))
    );
  }
}
