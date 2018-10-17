import { Component, OnInit } from '@angular/core';

import { ChatService } from "../../../_services/chat.service";

@Component({
    selector: 'app-chatroom-list',
    templateUrl: './chatroom-list.component.html',
    styleUrls: ['./chatroom-list.component.scss']
})
export class ChatroomListComponent implements OnInit {

    constructor(public chatService: ChatService) { }

    ngOnInit() {}

}
