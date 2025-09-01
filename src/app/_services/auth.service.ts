import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import {StorageService} from "./storage.service";

const AUTH_API = 'http://147.93.127.39:8084/api/auth/';
// const AUTH_API = 'http://localhost:8080/api/auth/';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  withCredentials: true
};

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private http: HttpClient, private userStorage:StorageService) { }

  login(username: string, password: string): Observable<any> {
    return this.http.post(
      AUTH_API + 'signin',
      {
        username,
        password,
      },
      httpOptions
    );
  }

  register(data:FormData): Observable<any> {

    let da = {username:data.get("username"),email: data.get("email"), password:data.get("password")};
    return this.http.post(
      AUTH_API + 'signup',
      da,
      httpOptions
    );
  }

  logout(){
    this.userStorage.clean();
  }
}
