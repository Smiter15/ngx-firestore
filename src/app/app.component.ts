import { Component, OnInit, OnDestroy } from '@angular/core';

import { Subscription } from "rxjs/index";

// Interfaces
import { Alert } from "./_interfaces/alert.interface";

// Services
import { AuthService } from "./_services/auth.service";
import { AlertService } from "./_services/alert.service";
import { LoadingService } from "./_services/loading.service";

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy{

    public alerts: Array<Alert> = [];
    private subscriptions: Subscription[] = [];
    public loading: boolean;

    constructor(private auth: AuthService,
                private alertService: AlertService,
                private loadingService: LoadingService) { }

    ngOnInit() {
        this.subscriptions.push(
            this.alertService.getAlert().subscribe(alert => {
                this.alerts.push(alert);
            })
        );

        this.subscriptions.push(
            this.loadingService.isLoading().subscribe(isLoading => {
                this.loading = isLoading;
            })
        );
    }

    ngOnDestroy() {
        this.subscriptions.forEach(sub => sub.unsubscribe());
    }

}
