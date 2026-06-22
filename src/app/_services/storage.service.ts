import { Injectable } from '@angular/core';
import {Router} from "@angular/router";
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

  public getUser(redirectIfExpired = false): any {
    const user = this.getStoredUser();

    if (!user?.accessToken) {
      return user;
    }

    if (this.isTokenExpired(user.accessToken)) {
      this.handleExpiredSession(redirectIfExpired);
      return null;
    }

    return user;
  }

  private getStoredUser(): any {
    const user = window.localStorage.getItem(USER_KEY);
    if (user) {
      return JSON.parse(user);
    }
    return null;
  }

  public getUserId(){
    const user = this.getUser(true);
    if(user){
      return user.id;
    }
    else{
      this.router.navigate(['/login']);
    }
  }

  public isLoggedIn(): boolean {
    return !!this.getUser();
  }

  public isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload?.exp;

      if (!exp) {
        return false;
      }

      return Date.now() >= exp * 1000;
    } catch {
      return true;
    }
  }

  public handleExpiredSession(redirectToLogin = true): void {
    this.clean();

    if (redirectToLogin) {
      this.router.navigate(['/login']);
    }
  }

}
