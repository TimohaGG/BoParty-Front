import { Injectable } from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";

const USER_KEY = 'auth-user';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  constructor(private router:Router) { }

  clean(): void {
    window.localStorage.removeItem(USER_KEY);
  }

  public saveUser(user: any): void {
    window.localStorage.removeItem(USER_KEY);
    window.localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  public getUser(): any {
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
