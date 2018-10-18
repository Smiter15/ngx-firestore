import { Injectable } from '@angular/core';
import { Router } from "@angular/router";

import { auth } from 'firebase';
import { AngularFireAuth } from "@angular/fire/auth";
import { AngularFirestore, AngularFirestoreDocument } from "@angular/fire/firestore";

import * as firebase from "firebase";

import { Observable, of } from "rxjs";
import { switchMap } from 'rxjs/operators';
import { fromPromise } from "rxjs/internal/observable/fromPromise";

import { AlertService } from "./alert.service";

import { User } from "../_interfaces/user.interface";

import { AlertType } from "../_enums/alert-type.enum";

@Injectable({
    providedIn: 'root'
})
export class AuthService {

    currentUser: Observable<User | null>;
    currentUserSnapshot: User | null;

    constructor(
        private afAuth: AngularFireAuth,
        private afs: AngularFirestore,
        private alertService: AlertService,
        private router: Router){

        this.currentUser = this.afAuth.authState.pipe(
            switchMap(user => {
                if (user) {
                    return this.afs.doc<User>(`users/${user.uid}`).valueChanges();
                } else {
                    return of(null);
                }
            })
        );
        this.setCurrentUserSnapshot();
    }

    private setCurrentUserSnapshot(): void {
        this.currentUser.subscribe(user => this.currentUserSnapshot = user);
    }

    ////// OAuth Methods /////

    facebookLogin() {
        const provider = new auth.FacebookAuthProvider();
        return this.oAuthLogin(provider);
    }

    private oAuthLogin(provider: any) {
        return this.afAuth.auth
            .signInWithPopup(provider)
            .then(credential => {
                return this.updateUserData(credential.user);
            })
            .catch(error => this.handleError(error));
    }

    //// Anonymous Auth ////

    anonymousLogin() {
        return this.afAuth.auth
            .signInAnonymously()
            .then(credential => {
                return this.updateUserData(credential.user); // if using firestore
            })
            .catch(error => {
                this.handleError(error);
            });
    }

    //// Email/Password Auth ////

    emailSignUp(email: string, password: string, displayName: string) {
        return fromPromise(
            this.afAuth.auth
                .createUserWithEmailAndPassword(email, password)
                .then((credential) => {
                    const userRef: AngularFirestoreDocument<User> = this.afs.doc(`users/${credential.user.uid}`);
                    const data = {
                        uid: credential.user.uid,
                        email: credential.user.email,
                        displayName: displayName,
                        photoURL: credential.user.photoURL || 'https://goo.gl/Fz9nrQ'
                    };

                    userRef.set(data, {merge: true});
                    return this.updateUserData(credential.user);
                })
                .catch(error => this.handleError(error))
        );
    }

    emailLogin(email: string, password: string) {
        return fromPromise(
            this.afAuth.auth
                .signInWithEmailAndPassword(email, password)
                .then(credential => {
                    return this.updateUserData(credential.user);
                })
                .catch(error => {
                    return this.handleError(error);
                })
        )
    }

    // Sends email allowing user to reset password
    resetPassword(email: string) {
        const fbAuth = auth();

        return fbAuth
            .sendPasswordResetEmail(email)
            .catch(error => this.handleError(error));
    }

    // Sets user data to firestore after successful login
    /*
    private updateUserData(user: User) {
        const userRef: AngularFirestoreDocument<User> = this.afs.doc(`users/${user.uid}`);
        return userRef.update({online: true});
    }
    */
    private updateUserData(user: User) {
        const userStatusRef: AngularFirestoreDocument = this.afs.doc(`status/${user.uid}`);

        firebase.database().ref('.info/connected').on('value', function(snapshot) {

            if (snapshot.val() == false) {
                userStatusRef.set({
                    state: 'offline',
                    lastChanged: firebase.firestore.FieldValue.serverTimestamp(),
                });
                return;
            }

            firebase.database().ref(`/status/${user.uid}`).onDisconnect() // Set up the disconnect hook
                .set({
                    state: 'offline',
                    lastChanged: firebase.database.ServerValue.TIMESTAMP,
                }) // The value to be set for this key when the client disconnects
                .then(() => {
                    firebase.database().ref(`/status/${user.uid}`).set({
                        state: 'online',
                        lastChanged: firebase.database.ServerValue.TIMESTAMP,
                    });
                    userStatusRef.set({
                        state: 'online',
                        lastChanged: firebase.firestore.FieldValue.serverTimestamp(),
                    });
                });
        });

        firebase.firestore().collection('status').where('state', '==', 'online')
            .onSnapshot(function(snapshot) {
                snapshot.docChanges().forEach(function(change) {
                    if (change.type === 'added') {
                        const msg = 'User ' + change.doc.id + ' is online.';
                        //console.log(msg);
                        // ...
                    }
                    if (change.type === 'removed') {
                        const msg = 'User ' + change.doc.id + ' is offline.';
                        //console.log(msg);
                        // ...
                    }
                });
            });

    }

    signOut() {
        firebase.database().ref(`/status/${this.currentUserSnapshot.uid}`).set({
            state: 'offline',
            lastChanged: firebase.database.ServerValue.TIMESTAMP,
        });
        this.afs.doc(`status/${this.currentUserSnapshot.uid}`).set({
            state: 'offline',
            lastChanged: firebase.firestore.FieldValue.serverTimestamp(),
        });
        this.afAuth.auth.signOut().then(() => {
            this.router.navigate(['/']);
        });
    }

    // If error, console log and notify user
    private handleError(error: Error) {
        console.error(error);
        this.alertService.sendAlert(error.message, AlertType.Danger);
        return false;
    }

}
