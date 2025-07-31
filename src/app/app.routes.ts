
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { RegisterComponent } from './components/user-components/register/register.component';
import { LoginComponent } from './components/user-components/login/login.component';
import { ProfileComponent } from './profile/profile.component';
import {OrdersListItemComponent} from "./components/order-components/orders-list-item/orders-list-item.component";
import {OrdersListComponent} from "./components/order-components/orders-list/orders-list.component";
import {authGuard} from "./secutiry/auth.guard";
import {PositionsListComponent} from "./components/positions-components/positions-list/positions-list.component";
import {
  IngredientsListComponent
} from "./components/ingredients-components/ingredients-list/ingredients-list.component";

export const routes: Routes = [
  { path: 'home', component: OrdersListComponent,canActivate:[authGuard] },
  { path: 'login', component: LoginComponent,  },
  { path: 'register', component: RegisterComponent },
  { path: 'profile', component: ProfileComponent,canActivate:[authGuard] },
  {path: 'positions', component: PositionsListComponent,canActivate:[authGuard]},
  {path: 'ingredients', component: IngredientsListComponent,canActivate:[authGuard]},
  { path: '', redirectTo: 'home', pathMatch: 'full' },
];
