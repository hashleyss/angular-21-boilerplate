import { Injectable } from '@angular/core';
import { HttpRequest, HttpResponse, HttpHandler, HttpEvent, HttpInterceptor, HTTP_INTERCEPTORS } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { delay, mergeMap, materialize, dematerialize } from 'rxjs/operators';

import { Account } from '../_models';
import { AlertService } from '../_services';
import { environment } from '../../environments/environment';

const usersKey = 'angular21-demo-users';

function getUsers(): Account[] {
    return JSON.parse(localStorage.getItem(usersKey) || '[]');
}

function saveUsers(users: Account[]) {
    localStorage.setItem(usersKey, JSON.stringify(users));
}

// Fix 1 — include role in JWT payload
function generateJwtToken(user: any) {
    const payload = {
        sub: user.id,
        role: user.role, // ← added role
        exp: Math.floor(Date.now() / 1000) + (15 * 60)
    };
    return btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' })) + '.' + btoa(JSON.stringify(payload)) + '.signature';
}

@Injectable()
export class FakeBackendInterceptor implements HttpInterceptor {
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const { url, method, headers, body } = request;

        return of(null).pipe(mergeMap(() => {
            // authenticate
            if (url.endsWith('/accounts/authenticate') && method === 'POST') {
                const { email, password } = body;
                const users = getUsers();
                const user = users.find((x: any) => x.email === email && x.password === password);
                if (!user) return error('Email or password is incorrect');

                if (!user.isVerified) return error('Email not verified');

                const jwtToken = generateJwtToken(user);
                const account = { ...user, jwtToken };

                localStorage.setItem('refreshToken', 'fake-refresh-token-' + user.id);

                return ok(account);
            }

            // Fix 2 — refresh token finds the correct logged-in user
            if (url.endsWith('/accounts/refresh-token') && method === 'POST') {
                const rt = localStorage.getItem('refreshToken');
                if (!rt) return unauthorized();

                // extract user id from token
                const userId = rt.replace('fake-refresh-token-', '');
                const users = getUsers();
                const user = users.find((x: any) => x.id === userId); // ← find correct user
                if (!user) return unauthorized();

                const jwtToken = generateJwtToken(user);
                const account = { ...user, jwtToken };
                return ok(account);
            }

            // revoke token
            if (url.endsWith('/accounts/revoke-token') && method === 'POST') {
                localStorage.removeItem('refreshToken');
                return ok();
            }

            // register
            if (url.endsWith('/accounts/register') && method === 'POST') {
                const user = body;
                const users = getUsers();
                if (users.find((x: any) => x.email === user.email)) {
                    return error('Email "' + user.email + '" is already registered');
                }

                user.id = Math.floor(Math.random() * 100000).toString();
                user.role = 'Admin';
                user.isVerified = true;
                users.push(user);
                saveUsers(users);

                return ok();
            }

            // verify email
            if (url.endsWith('/accounts/verify-email') && method === 'POST') {
                const { token } = body;
                const users = getUsers();
                const user = users.find((x: any) => x.id === token);
                if (!user) return error('Verification failed');
                user.isVerified = true;
                saveUsers(users);
                return ok();
            }

            // forgot password
            if (url.endsWith('/accounts/forgot-password') && method === 'POST') {
                const { email } = body;
                const users = getUsers();
                const user = users.find((x: any) => x.email === email);
                if (!user) return ok();

                try {
                    const alertService = new AlertService();
                    alertService.info(`Reset password (fake) for ${email}: <a href="#/account/reset-password?token=${user.id}">Reset</a>`, { keepAfterRouteChange: true });
                } catch { }

                return ok();
            }

            // get all accounts
            if (url.endsWith('/accounts') && method === 'GET') {
                if (!isLoggedIn()) return unauthorized();
                return ok(getUsers().map((u: any) => ({ ...u, password: undefined })));
            }

            // get by id
            if (url.match(/\/accounts\/\d+$/) && method === 'GET') {
                if (!isLoggedIn()) return unauthorized();
                const id = url.split('/').pop();
                const user = getUsers().find((x: any) => x.id === id);
                return ok(user);
            }

            // create
            if (url.endsWith('/accounts') && method === 'POST') {
                const params = body;
                const users = getUsers();
                params.id = Math.floor(Math.random() * 100000).toString();
                params.isVerified = true;
                users.push(params);
                saveUsers(users);
                return ok();
            }

            // update
            if (url.match(/\/accounts\/\d+$/) && method === 'PUT') {
                if (!isLoggedIn()) return unauthorized();
                const id = url.split('/').pop();
                const users = getUsers();
                const idx = users.findIndex((x: any) => x.id === id);
                users[idx] = { ...users[idx], ...body };
                saveUsers(users);
                return ok(users[idx]);
            }

            // delete
            if (url.match(/\/accounts\/\d+$/) && method === 'DELETE') {
                if (!isLoggedIn()) return unauthorized();
                const id = url.split('/').pop();
                const users = getUsers().filter((x: any) => x.id !== id);
                saveUsers(users);
                return ok();
            }

            return next.handle(request);

            function ok(body?: any) {
                return of(new HttpResponse({ status: 200, body })) as Observable<HttpEvent<any>>;
            }

            function unauthorized() {
                return throwError(() => ({ status: 401, error: { message: 'Unauthorized' } }));
            }

            function error(message: string) {
                return throwError(() => ({ status: 400, error: { message } }));
            }

            function isLoggedIn() {
                return !!localStorage.getItem('refreshToken');
            }
        }))
        .pipe(materialize(), delay(500), dematerialize());
    }
}

export const fakeBackendProvider = {
    provide: HTTP_INTERCEPTORS,
    useClass: FakeBackendInterceptor,
    multi: true
};