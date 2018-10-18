import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';

// Guards
import { AuthGuard } from "./_guards/logged-in.guard";
import { AlwaysAuthGuard } from './_guards/always-auth.guard';
import { IsOwnerGuard } from "./_guards/is-owner.guard";

// Components
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from "./register/register.component";
import { HomeComponent } from "./home/home.component";
import { ChatComponent } from "./chat/chat.component";
import { UserProfileComponent } from "./user-profile/user-profile.component";
import { UserProfileEditComponent } from "./user-profile-edit/user-profile-edit.component";

// Routes
const appRoutes: Routes = [
    { path: '', pathMatch: 'full', redirectTo: '/login', canActivate: [AlwaysAuthGuard] },
    { path: 'login', component: LoginComponent, canActivate: [AlwaysAuthGuard] },
    { path: 'register', component: RegisterComponent, canActivate: [AlwaysAuthGuard] },
    { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
    { path: 'chat', canActivate: [AuthGuard],
        children: [
            { path: '', component: ChatComponent, outlet: 'chat' },
            { path: ':chatRoomId', component: ChatComponent, outlet: 'chat' }
        ]
    },
    { path: 'profile/:userId', component: UserProfileComponent, canActivate: [AuthGuard] },
    { path: 'profile/:userId/edit', component: UserProfileEditComponent, canActivate: [AuthGuard, IsOwnerGuard] },
    { path: '**', redirectTo: '' }
];

@NgModule({
    imports: [
        RouterModule.forRoot(appRoutes, { preloadingStrategy: PreloadAllModules })
    ],
    exports: [RouterModule],
    providers: []
})
export class AppRoutingModule { }
