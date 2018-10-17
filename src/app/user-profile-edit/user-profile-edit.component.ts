import { Component, OnInit, OnDestroy } from '@angular/core';
import { Location } from "@angular/common";
import { ActivatedRoute } from "@angular/router";

import { Subscription } from "rxjs/index";
import { AngularFirestore, AngularFirestoreDocument } from "@angular/fire/firestore";
import { AngularFireStorage } from "@angular/fire/storage";

import { AuthService } from "../_services/auth.service";
import { AlertService } from "../_services/alert.service";
import { LoadingService } from "../_services/loading.service"

import { User } from "../_interfaces/user.interface";

import { AlertType } from "../_enums/alert-type.enum";

@Component({
    selector: 'app-user-profile-edit',
    templateUrl: './user-profile-edit.component.html',
    styleUrls: ['./user-profile-edit.component.scss']
})
export class UserProfileEditComponent implements OnInit, OnDestroy {

    public currentUser: any = null;
    public userId: string = '';
    private subscriptions: Subscription[] = [];
    public uploadPercent: number = 0;
    public downloadURL: string | null = null;

    constructor(private afs: AngularFirestore,
                private fs: AngularFireStorage,
                private route: ActivatedRoute,
                private location: Location,
                private auth: AuthService,
                private alertService: AlertService,
                private loadingService: LoadingService) {

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
            this.route.paramMap.subscribe(params => {
                this.userId = params.get('userId');
            })
        );
    }

    ngOnDestroy() {
        this.subscriptions.forEach(sub => sub.unsubscribe());
    }

    uploadFile(e): void {
        const file = e.target.files[0];
        const filePath = `${file.name}_${this.currentUser.uid}`;
        const fileRef = this.fs.ref(filePath);
        const task = this.fs.upload(filePath, file);

        this.subscriptions.push(
            task.percentageChanges().subscribe(percentage => {
                (percentage < 100) ? this.loadingService.setLoading(true): this.loadingService.setLoading(false);
                this.uploadPercent = percentage;
            })
        );

        this.subscriptions.push(
            fileRef.getDownloadURL().subscribe(url => this.downloadURL = url)
        );
    }

    save(): void {
        const photo = (this.downloadURL) ? this.downloadURL: this.currentUser.photoURL;

        const user = Object.assign({}, this.currentUser, {photoURL: photo});
        const userRef: AngularFirestoreDocument<User> = this.afs.doc(`users/${user.uid}`);
        userRef.set(user);
        this.alertService.sendAlert('Your profile successfully updated.', AlertType.Success);
        this.location.back();
    }

}
