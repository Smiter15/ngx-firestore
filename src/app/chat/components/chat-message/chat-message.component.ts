import { Component, Input, OnInit } from '@angular/core';

import { Message } from "../../../_interfaces/message.interface";

@Component({
    selector: 'app-chat-message',
    templateUrl: './chat-message.component.html',
    styleUrls: ['./chat-message.component.scss']
})
export class ChatMessageComponent implements OnInit {

    @Input() message: Message;

    constructor() { }

    ngOnInit() {}

}
