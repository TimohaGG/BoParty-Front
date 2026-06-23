import {Component, inject, OnInit, ViewChild} from '@angular/core';
import { Subscription } from 'rxjs';
import { StorageService } from './_services/storage.service';
import { AuthService } from './_services/auth.service';
import {RouterLink, RouterLinkActive, RouterOutlet} from "@angular/router";
import {MatToolbar} from "@angular/material/toolbar";
import {MatButton, MatIconButton} from "@angular/material/button";
import {MatIcon} from "@angular/material/icon";
import {
  MatSidenav,
  MatSidenavContainer,
  MatSidenavContent
} from "@angular/material/sidenav";
import {MatListItem, MatNavList} from "@angular/material/list";
import {entityStorage} from "./_helpers/storage/entityStorage";
import {SelectedOrderPosition} from "./models/Orders/SelectedOrderPosition";

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
  imports: [
    RouterOutlet,
    MatToolbar,
    MatIcon,
    MatSidenavContent,
    MatButton,
    MatSidenavContainer,
    MatSidenav,
    MatNavList,
    MatListItem,
    RouterLink,
    RouterLinkActive,
    MatIconButton
  ],
  standalone:true
})
export class AppComponent implements OnInit {

  @ViewChild('sidenav') sidenav?: MatSidenav;

  private roles: string[] = [];
  isLoggedIn = false;
  showAdminBoard = false;
  showModeratorBoard = false;
  username?: string;
  brandLogoSrc = '/assets/img/logo.png';

  opened=false;
  binOpened = false;

  private store = inject(entityStorage);
  private authStateSubscription?: Subscription;
  selectedOrderPositions = this.store.selectedOrderPositionsEntities;


  constructor(
    private storageService: StorageService,
    private authService: AuthService,
  ) {

  }
  ngOnInit(): void {
    this.authStateSubscription = this.storageService.authUser$.subscribe(user => this.applyUser(user));
  }

  ngOnDestroy(): void {
    this.authStateSubscription?.unsubscribe();
  }

  private applyUser(user: any): void {
    this.isLoggedIn = !!user;
    this.roles = user?.roles ?? [];
    this.showAdminBoard = this.roles.includes('ROLE_ADMIN');
    this.showModeratorBoard = this.roles.includes('ROLE_MODERATOR');
    this.username = user?.username;
    this.brandLogoSrc = this.getLogoSrc(user?.logo);
  }

  private getLogoSrc(logo?: string): string {
    if(!logo){
      return '/assets/img/logo.png';
    }

    if(logo.startsWith('data:') || logo.startsWith('http') || logo.startsWith('/')){
      return logo;
    }

    return `data:image/*;base64,${logo}`;
  }

  onLogoError(): void {
    this.brandLogoSrc = '/assets/img/logo.png';
  }

  toggleBin(): void {
    this.binOpened = !this.binOpened;
  }

  closeBin(): void {
    this.binOpened = false;
  }

  clearBin(): void {
    this.store.clearSelectedOrderPositions();
  }

  removeBinItem(id: number): void {
    this.store.removeSelectedOrderPosition(id);
  }

  getBinTotal(): number {
    return this.selectedOrderPositions().reduce((sum, item) => sum + item.position.price * item.amount, 0);
  }

  logout(): void {
    this.authService.logout();
    this.storageService.clean();
    window.location.reload();

  }
}
