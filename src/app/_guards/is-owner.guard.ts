import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { Observable } from "rxjs";
import { map, take, tap } from "rxjs/operators";

import { AuthService } from "../_services/auth.service";
import { AlertService } from "../_services/alert.service";

import { Alert } from "../_interfaces/alert.interface";

import { AlertType } from "../_enums/alert-type.enum";
import {current} from "codelyzer/util/syntaxKind";

@Injectable({
    providedIn: 'root',
})
export class IsOwnerGuard implements CanActivate {

    constructor(private router: Router,
                private auth: AuthService,
                private alertService: AlertService) {

    }

    canActivate(
        next: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
        return this.auth.currentUser.pipe(
            take(1),
            map((currentUser) => !!currentUser && currentUser.uid === next.params.userId),
            tap((isOwner) => {
                if (!isOwner) {
                    this.alertService.sendAlert('You can only edit your own profile.', AlertType.Danger);
                    this.router.navigate(['/login'], {queryParams: {returnUrl: state.url}});
                }
            })
        );
    }
}
