
import { Routes } from '@angular/router';

import { RegisterComponent } from './components/user-components/register/register.component';
import { LoginComponent } from './components/user-components/login/login.component';
import { ProfileComponent } from './profile/profile.component';
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
import {ShoppingComponent} from "./components/menu-components/shopping/shopping.component";
import {WaitersListComponent} from "./components/waiters-components/waiters-list/waiters-list.component";

export const routes: Routes = [
  { path: 'service/orders', component: MenusListComponent,canActivate:[authGuard] },
  { path: 'service/login', component: LoginComponent,  },
  { path: 'service/register', component: RegisterComponent },
  { path: 'service/profile', component: ProfileComponent,canActivate:[authGuard] },
  {path: 'service/positions', component: PositionsListComponent,canActivate:[authGuard]},
  {path: 'service/ingredients', component: IngredientsListComponent,canActivate:[authGuard]},
  {path: 'service/waiters', component: WaitersListComponent,canActivate:[authGuard]},
  {path: 'service/orders/new', component: AddMenuComponent,canActivate:[authGuard]},
  {path: 'service/reports/orders', component: OrderListComponent,canActivate:[authGuard]},
  {path: 'service/orders/:orderId/shopping', component: ShoppingComponent,canActivate:[authGuard]},
  { path: 'home', redirectTo: 'service/orders', pathMatch: 'full' },
  { path: 'order/create', redirectTo: 'service/orders/new', pathMatch: 'full' },
  { path: 'order/data', redirectTo: 'service/reports/orders', pathMatch: 'full' },
  { path: 'orders', redirectTo: 'service/orders', pathMatch: 'full' },
  { path: 'login', redirectTo: 'service/login', pathMatch: 'full' },
  { path: 'register', redirectTo: 'service/register', pathMatch: 'full' },
  { path: 'profile', redirectTo: 'service/profile', pathMatch: 'full' },
  { path: 'positions', redirectTo: 'service/positions', pathMatch: 'full' },
  { path: 'ingredients', redirectTo: 'service/ingredients', pathMatch: 'full' },
  { path: 'waiters', redirectTo: 'service/waiters', pathMatch: 'full' },
  { path: 'reports/orders', redirectTo: 'service/reports/orders', pathMatch: 'full' },

  { path: '', redirectTo: 'service/orders', pathMatch: 'full' },
];
