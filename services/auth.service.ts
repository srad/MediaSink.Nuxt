import type { MyClient } from "./api/v1/ClientFactory";
import type { RequestsAuthenticationRequest } from "./api/v1/StreamSinkClient";
import type { CookieRef } from "#imports";

export interface AuthInfo {
  token: string;
}

export interface AuthHeader {
  Authorization: string;
}

export const TOKEN_NAME = "jwt";

export default class AuthService {
  private readonly tokenCookie: CookieRef<string>

  constructor(tokenCookie: CookieRef<string>) {
    this.tokenCookie = tokenCookie;
  }

  login(user: RequestsAuthenticationRequest, client: MyClient) {
    return new Promise<string>((resolve, reject) => {
      client.auth.loginCreate(user).then(response => {
        const r = response.data as unknown as AuthInfo;
        if (r.token) {
          this.tokenCookie.value = r.token;
          return resolve(r.token);
        } else {
          return reject("token not found");
        }
      }).catch(reject);
    });
  }

  logout() {
    this.tokenCookie.value = null;
  }

  getToken(): string {
    return this.tokenCookie.value;
  }

  isLoggedIn(): boolean {
    return this.tokenCookie.value !== null && this.tokenCookie.value !== undefined;
  }

  signup(user: RequestsAuthenticationRequest, client: MyClient) {
    return client.auth.signupCreate(user);
  }

  getAuthHeader(): AuthHeader | null {
    if (!this.tokenCookie.value) {
      return null;
    }

    return { Authorization: 'Bearer ' + this.tokenCookie.value };
  }
}