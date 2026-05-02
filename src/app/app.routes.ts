
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { RegisterComponent } from './components/user-components/register/register.component';
import { LoginComponent } from './components/user-components/login/login.component';
import { ProfileComponent } from './profile/profile.component';
import {MenusListItemComponent} from "./components/menu-components/menus-list-item/menus-list-item.component";
import {MenusListComponent} from "./components/menu-components/menus-list/menus-list.component";
import {authGuard} from "./secutiry/auth.guard";
import {PositionsListComponent} from "./components/positions-components/positions-list/positions-list.component";
import {
  IngredientsListComponent
} from "./components/ingredients-components/ingredients-list/ingredients-list.component";
import {AddMenuComponent} from "./components/menu-components/add-menu/add-menu.component";
import {
  OrderListComponent
} from "./components/orders-components/order-list-component/order-list.component";

export const routes: Routes = [
  { path: 'home', component: MenusListComponent,canActivate:[authGuard] },
  { path: 'login', component: LoginComponent,  },
  { path: 'register', component: RegisterComponent },
  { path: 'profile', component: ProfileComponent,canActivate:[authGuard] },
  {path: 'positions', component: PositionsListComponent,canActivate:[authGuard]},
  {path: 'ingredients', component: IngredientsListComponent,canActivate:[authGuard]},
  {path: 'order/create', component: AddMenuComponent,canActivate:[authGuard]},
  {path: 'order/data', component: OrderListComponent,canActivate:[authGuard]},
  { path: '', redirectTo: 'home', pathMatch: 'full' },
];
