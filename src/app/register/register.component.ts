import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";

import { Subscription } from "rxjs/index";

import { AlertType } from "../_enums/alert-type.enum";

import { AuthService } from "../_services/auth.service";
import { AlertService } from "../_services/alert.service";
import { LoadingService } from "../_services/loading.service";

@Component({
    selector: 'app-register',
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit, OnDestroy {

    public registerForm: FormGroup;
    private subscriptions: Subscription[] = [];

    constructor(private fb: FormBuilder,
                private auth: AuthService,
                private alertService: AlertService,
                private loadingService: LoadingService,
                private router: Router) {
        this.createForm();
    }

    ngOnInit() {}

    ngOnDestroy() {
        this.subscriptions.forEach(sub => sub.unsubscribe());
    }

    private createForm() {
        this.registerForm = this.fb.group({
            displayName: ['', [Validators.required]],
            email: ['', [Validators.email, Validators.required]],
            password: ['', [Validators.minLength(8), Validators.required]],
            confirmPassword: ['', []]
            }, { validator: this.checkPasswordsMatch('password', 'confirmPassword') }
        )
    }

    public submitRegister(): void {
        if (this.registerForm.valid) {
            this.loadingService.setLoading(true);
            const {displayName, email, password} = this.registerForm.value;
            this.auth.emailSignUp(email, password, displayName).subscribe(success => {
                this.loadingService.setLoading(false);
                if (success !== false) {
                    console.log('register sucess', success);
                    this.router.navigate(['/home']);
                }
            }, err => {
                console.log(err);
                this.loadingService.setLoading(false);
                this.alertService.sendAlert('There was an error registering, try again.', AlertType.Danger);
            })
        } else {
            this.alertService.sendAlert('Please enter valid name, email and password.', AlertType.Danger);
        }
    }

    checkPasswordsMatch(passwordKey: string, passwordConfirmationKey: string) {
        return (group: FormGroup) => {
            const passwordInput = group.controls[passwordKey],
                passwordConfirmationInput = group.controls[passwordConfirmationKey];
            if (passwordInput.value !== passwordConfirmationInput.value) {
                return passwordConfirmationInput.setErrors({notEquivalent: true});
            } else {
                return passwordConfirmationInput.setErrors(null);
            }
        };
    }

}
