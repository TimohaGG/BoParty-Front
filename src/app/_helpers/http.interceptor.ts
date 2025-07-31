// import { Injectable } from '@angular/core';
// import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HTTP_INTERCEPTORS } from '@angular/common/http';
// import { Observable } from 'rxjs';
// import {AuthService} from "../_services/auth.service";
// import {StorageService} from "../_services/storage.service";
//
// @Injectable()
// export class HttpRequestInterceptor implements HttpInterceptor {
//
//   constructor(private storage: StorageService) { }
//
//
//   intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
//     console.log(this.storage.getUser());
//     alert("Hello!");
//     req = req.clone({
//       withCredentials: true,
//       headers: req.headers.set('Authorization', 'Bearer ' + this.storage.getUser()?.accessToken)
//     });
//
//     console.log(req);
//
//     return next.handle(req);
//   }
// }
//
// export const httpInterceptorProviders = [
//   { provide: HTTP_INTERCEPTORS, useClass: HttpRequestInterceptor, multi: true },
// ];

import {HttpInterceptorFn} from "@angular/common/http";
import {inject} from "@angular/core";
import {StorageService} from "../_services/storage.service";

export const HttpRequestInterceptor: HttpInterceptorFn = (req, next) => {
  const storage = inject(StorageService);
  const token = storage.getUser()?.accessToken;

  if (token) {
    req = req.clone({
      withCredentials: true,
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
  }

  return next(req);
};
