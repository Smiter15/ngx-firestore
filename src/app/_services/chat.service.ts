import { Injectable } from '@angular/core';

import { BehaviorSubject, Observable, of } from "rxjs";
import { switchMap, map } from "rxjs/operators";

import { AngularFirestore } from "@angular/fire/firestore";

import { AuthService } from "./auth.service";

@Injectable({
    providedIn: 'root'
})
export class ChatService {

    public chatRooms: Observable<any>;
    public changeChatRoom: BehaviorSubject<string | null> = new BehaviorSubject(null);
    public selectedChatRoom: Observable<any>;
    public selectedChatRoomMessages: Observable<any>;

    constructor(private afs: AngularFirestore,
                private auth: AuthService) {

        this.selectedChatRoom = this.changeChatRoom.pipe(
            switchMap((chatRoomId) => {
                if (chatRoomId) {
                    return this.afs.doc(`chatrooms/${chatRoomId}`).valueChanges();
                } else {
                    return of(null);
                }
            })
        );

        this.selectedChatRoomMessages = this.changeChatRoom.pipe(
            switchMap((chatRoomId) => {
                if (chatRoomId) {
                    return this.afs.collection(`chatrooms/${chatRoomId}/messages`, ref => {
                        return ref.orderBy('createdAt', 'desc').limit(100);
                    })
                    .valueChanges()
                    .pipe(
                        map(arr => arr.reverse())
                    );
                } else {
                    return of(null);
                }
            })
        );

        this.chatRooms = afs.collection('chatrooms').valueChanges();
    }

    public sendMessage(text: string): void {
        const chatRoomId = this.changeChatRoom.value;
        const message = {
            message: text,
            createdAt: new Date(),
            sender: this.auth.currentUserSnapshot
        };
        this.afs.collection(`chatrooms/${chatRoomId}/messages`).add(message);
    }

}
