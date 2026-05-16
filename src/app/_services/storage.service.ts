import { Injectable } from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {BehaviorSubject} from "rxjs";

const USER_KEY = 'auth-user';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private authUserSubject = new BehaviorSubject<any>(this.getStoredUser());
  public authUser$ = this.authUserSubject.asObservable();

  constructor(private router:Router) { }

  clean(): void {
    window.localStorage.removeItem(USER_KEY);
    this.authUserSubject.next(null);
  }

  public saveUser(user: any): void {
    window.localStorage.removeItem(USER_KEY);
    window.localStorage.setItem(USER_KEY, JSON.stringify(user));
    this.authUserSubject.next(user);
  }

  public getUser(): any {
    return this.getStoredUser();
  }

  private getStoredUser(): any {
    const user = window.localStorage.getItem(USER_KEY);
    if (user) {
      return JSON.parse(user);
    }
    return null;
  }

  public getUserId(){
    const user = window.localStorage.getItem(USER_KEY);
    if(user){
      return JSON.parse(user).id;
    }
    else{
      this.router.navigate(['/login']);
    }
  }

  public isLoggedIn(): boolean {
    const user = window.localStorage.getItem(USER_KEY);
    if (user) {
      return true;
    }

    return false;
  }


}
