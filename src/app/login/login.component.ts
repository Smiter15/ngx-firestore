import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";

import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/firestore';
import { Observable, Subscription } from 'rxjs';

import { AuthService } from "../_services/auth.service"
import { AlertService } from "../_services/alert.service";
import { LoadingService } from "../_services/loading.service";

import { AlertType } from "../_enums/alert-type.enum";

import { Note } from "../_interfaces/note.interface";

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {

    public loginForm: FormGroup;
    private subscriptions: Subscription[] = [];
    private returnUrl: string;

    notesCollection: AngularFirestoreCollection<Note>;
    noteDocument: AngularFirestoreDocument<Note>;
    notes: Observable<Note[]>;
    note: Observable<Note>;

    newContent: string;

    constructor(private fb: FormBuilder,
                private afs: AngularFirestore,
                public auth: AuthService,
                private alertService: AlertService,
                private loadingService: LoadingService,
                private router: Router,
                private route: ActivatedRoute) {
        this.createForm();
    }

    ngOnInit() {
        this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/chat';

        this.subscriptions.push(
            this.auth.currentUser.subscribe(user => {
                if (!!user) {
                    this.router.navigateByUrl('/chat');
                }
            })
        );

        this.notesCollection = this.afs.collection('notes', ref => {
            return ref.orderBy('content'); // can do orderBy + where clause etc
        }); // reference
        this.notes = this.notesCollection.valueChanges();  // observable of notes data
        this.noteDocument = this.afs.doc('notes/UhwETab0FKIu3OdPaZRF');
        this.note = this.noteDocument.valueChanges();
    }

    ngOnDestroy() {
        this.subscriptions.forEach(sub => sub.unsubscribe());
    }

    private createForm(): void {
        this.loginForm = this.fb.group({
            email: ['', [Validators.email, Validators.required]],
            password: ['', [Validators.minLength(8), Validators.required]]
        })
    }

    public submitLogin(): void {
        if (this.loginForm.valid) {
            this.loadingService.setLoading(true);
            const {email, password} = this.loginForm.value;
            this.auth.emailLogin(email, password).subscribe(success => {
                this.loadingService.setLoading(false);
                if (success !== false) {
                    console.log('emial login', success);
                    this.router.navigateByUrl(this.returnUrl);
                }
            }, err => { this.loadingService.setLoading(false); })
        } else {
            this.alertService.sendAlert('Your email or password were invalid, try again.', AlertType.Danger);
        }
    }

    async signInWithFacebook() {
        await this.auth.facebookLogin();
        await this.afterSignIn();
    }

    async signInAnonymously() {
        await this.auth.anonymousLogin();
        return await this.afterSignIn();
    }

    private afterSignIn() {
        // Do after login stuff here, such router redirects, toast messages, etc.
        return this.router.navigate(['/chat']);
    }

    updateContent() {
        this.noteDocument.update({content: this.newContent});
    }

}
