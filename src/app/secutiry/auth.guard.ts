import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import {StorageService} from "../_services/storage.service";

export const authGuard: CanActivateFn = (route, state) => {
  const storage = inject(StorageService);
  const router = inject(Router);

  const user = storage.getUser(true);
  if (user && user.accessToken) {
    return true;
  } else {
    // Redirect to login if not authenticated
    return router.createUrlTree(['/service/login']);
  }
};


export const adminGuard: CanActivateFn = (route, state) => {
  const storage = inject(StorageService);
  const router = inject(Router);

  const user = storage.getUser(true);

  if (user.roles.includes('ROLE_ADMIN')) {
    return true;
  }
  else if(!user && !user.accessToken) {
    // Redirect to login if not authenticated
    return router.createUrlTree(['/service/login']);
  }
  else {

    return router.createUrlTree(['/menu']);
  }
};
