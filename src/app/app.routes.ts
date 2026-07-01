
import { Routes } from '@angular/router';

import { RegisterComponent } from './components/user-components/register/register.component';
import { LoginComponent } from './components/user-components/login/login.component';
import { ProfileComponent } from './profile/profile.component';
import {MenusListComponent} from "./components/menu-components/menus-list/menus-list.component";
import {adminGuard, authGuard} from "./secutiry/auth.guard";
import {PositionsListComponent} from "./components/positions-components/positions-list/positions-list.component";
import {
  IngredientsListComponent
} from "./components/ingredients-components/ingredients-list/ingredients-list.component";
import {AddMenuComponent} from "./components/menu-components/add-menu/add-menu.component";
import {
  OrderListComponent
} from "./components/expences-components/expenses-list-component/order-list.component";
import {ShoppingComponent} from "./components/menu-components/shopping/shopping.component";
import {WaitersListComponent} from "./components/waiters-components/waiters-list/waiters-list.component";
import {OrderSelectionComponent} from "./components/menu-components/order-selection/order-selection.component";
import {WelcomePageComponent} from "./components/public-components/welcome-page/welcome-page.component";
import {BoxesListComponent} from "./components/boxes-components/boxes-list/boxes-list.component";
import {
  PositionsAccessibilityComponent
} from "./components/positions-components/positions-accessibility/positions-accessibility.component";

export const routes: Routes = [
  {path:'home',component:WelcomePageComponent},
  {path:'menu',component:OrderSelectionComponent},
  { path: 'service/orders', component: MenusListComponent,canActivate:[authGuard, adminGuard] },
  { path: 'service/login', component: LoginComponent,  },
  { path: 'service/register', component: RegisterComponent },
  { path: 'service/profile', component: ProfileComponent,canActivate:[authGuard] },
  {path: 'service/positions', component: PositionsListComponent,canActivate:[authGuard,adminGuard]},
  {path: 'service/positions/availability', component: PositionsAccessibilityComponent,canActivate:[authGuard,adminGuard]},
  // {path: 'service/boxes', component: BoxesListComponent,canActivate:[authGuard,adminGuard]},
  {path: 'service/ingredients', component: IngredientsListComponent,canActivate:[authGuard,adminGuard]},
  {path: 'service/waiters', component: WaitersListComponent,canActivate:[authGuard,adminGuard]},
  {path: 'service/orders/new', component: AddMenuComponent,canActivate:[authGuard,adminGuard]},
  {path: 'service/reports/orders', component: OrderListComponent,canActivate:[authGuard,adminGuard]},
  {path: 'service/orders/:orderId/shopping', component: ShoppingComponent,canActivate:[authGuard,adminGuard]},
  { path: 'order/create', redirectTo: 'service/orders/new', pathMatch: 'full' },
  { path: 'order/data', redirectTo: 'service/reports/orders', pathMatch: 'full' },
  { path: 'orders', redirectTo: 'service/orders', pathMatch: 'full' },
  { path: 'login', redirectTo: 'service/login', pathMatch: 'full' },
  { path: 'register', redirectTo: 'service/register', pathMatch: 'full' },
  { path: 'profile', redirectTo: 'service/profile', pathMatch: 'full' },
  { path: 'positions', redirectTo: 'service/positions', pathMatch: 'full' },
  { path: 'positions/availability', redirectTo: 'service/positions/availability', pathMatch: 'full' },
  { path: 'boxes', redirectTo: 'service/boxes', pathMatch: 'full' },
  { path: 'ingredients', redirectTo: 'service/ingredients', pathMatch: 'full' },
  { path: 'waiters', redirectTo: 'service/waiters', pathMatch: 'full' },
  { path: 'reports/orders', redirectTo: 'service/reports/orders', pathMatch: 'full' },

  { path: '', component: WelcomePageComponent, pathMatch: 'full' },
];
