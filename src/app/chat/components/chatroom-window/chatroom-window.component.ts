import { Component, OnDestroy, OnInit, AfterViewChecked, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from "@angular/router";

import { Observable, Subscription } from "rxjs/index";

import { ChatService } from "../../../_services/chat.service";

@Component({
    selector: 'app-chatroom-window',
    templateUrl: './chatroom-window.component.html',
    styleUrls: ['./chatroom-window.component.scss']
})
export class ChatroomWindowComponent implements OnInit, OnDestroy, AfterViewChecked {

    @ViewChild('scrollContainer') private SC: ElementRef;

    private subscriptions: Subscription[] = [];
    public chatRoom : Observable<any>;
    public messages: Observable<any>;

    constructor(private route: ActivatedRoute,
                private chatService: ChatService) {

        this.subscriptions.push(
            this.chatService.selectedChatRoom.subscribe(chatRoom => {
                this.chatRoom = chatRoom;
            })
        );

        this.subscriptions.push(
            this.chatService.selectedChatRoomMessages.subscribe(messages => {
                this.messages = messages;
            })
        );
    }

    ngOnInit() {
        this.scrollToBottom();
        this.subscriptions.push(
            this.route.paramMap.subscribe(params => {
                const chatRoomId = params.get('chatRoomId');
                this.chatService.changeChatRoom.next(chatRoomId);
            })
        )
    }

    ngOnDestroy() {
        this.subscriptions.forEach(sub => sub.unsubscribe());
    }

    ngAfterViewChecked() {
        this.scrollToBottom();
    }

    private scrollToBottom(): void {
        try {
            this.SC.nativeElement.scrollTop = this.SC.nativeElement.scrollHeight;
        } catch(err) { }
    }

}
