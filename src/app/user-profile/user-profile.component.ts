import { Component } from '@angular/core';
import { ActivatedRoute } from "@angular/router";

import { AuthService } from "../_services/auth.service";

import { AngularFirestore, AngularFirestoreDocument } from "@angular/fire/firestore";

import { Subscription } from "rxjs";

import { User } from "../_interfaces/user.interface";

import { LoadingService } from "../_services/loading.service";

@Component({
    selector: 'user-profile',
    templateUrl: './user-profile.component.html',
    styleUrls: ['./user-profile.component.scss'],
})
export class UserProfileComponent {

    public currentUser: any = null;
    public user: User;
    private subscriptions: Subscription[] = [];

    constructor(
        private auth: AuthService,
        private loadingService: LoadingService,
        private route: ActivatedRoute,
        private afs: AngularFirestore
    ) {
        this.loadingService.setLoading(true);
    }

    ngOnInit() {
        this.subscriptions.push(
            this.auth.currentUser.subscribe(user => {
                this.currentUser = user;
                this.loadingService.setLoading(false);
            })
        );

        this.subscriptions.push(
            this.route.paramMap.subscribe( params => {
                const userId = params.get('userId');
                const userRef: AngularFirestoreDocument<User> = this.afs.doc(`users/${userId}`);
                userRef.valueChanges().subscribe(user => this.user = user);
            })
        );
    }

    ngOnDestroy() {
        this.subscriptions.forEach(sub => sub.unsubscribe());
    }

}
