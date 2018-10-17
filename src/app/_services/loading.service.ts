import { Injectable } from '@angular/core';
import { Observable, Subject } from "rxjs/index";

@Injectable({
    providedIn: 'root'
})
export class LoadingService {

    public loading: Subject<boolean> = new Subject();

    constructor() { }

    setLoading(loading: boolean) {
        this.loading.next(loading);
    }

    isLoading(): Observable<any> {
        return this.loading.asObservable();
    }
}
