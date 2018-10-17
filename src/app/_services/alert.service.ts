import { Injectable } from '@angular/core';

import { Observable, Subject } from "rxjs";

// Interfaces
import { Alert } from "../_interfaces/alert.interface";

@Injectable({
    providedIn: 'root'
})
export class AlertService {

    public alerts = new Subject<Alert>();

    constructor() { }

    sendAlert(message: string, type) {
        this.alerts.next({ text: message, type: type });
    }

    getAlert(): Observable<any> {
        return this.alerts.asObservable();
    }
}
