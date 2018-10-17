import { Component, OnInit } from '@angular/core';

import { ChatService } from "../../../_services/chat.service";

@Component({
    selector: 'app-chat-input',
    templateUrl: './chat-input.component.html',
    styleUrls: ['./chat-input.component.scss']
})
export class ChatInputComponent implements OnInit {

    public newMessageText: string = '';

    constructor(private chatService: ChatService) { }

    ngOnInit() {}

    public submit(message: string): void {
        this.chatService.sendMessage(message);
        this.newMessageText = '';
    }

}
