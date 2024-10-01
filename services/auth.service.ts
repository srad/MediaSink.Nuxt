import { createClient } from "./api/v1/ClientFactory";
import type { RequestsAuthenticationRequest } from "./api/v1/StreamSinkClient";
import { getCookie, removeCookie, setCookie } from "~/utils/cookies";

export interface AuthInfo {
  token: string;
}

export interface AuthHeader {
  Authorization: string;
}

const TOKEN_NAME = "jwt";

export default class AuthService {
  static login(user: RequestsAuthenticationRequest) {
    return new Promise<string>((resolve, reject) => {
      const token = getCookie<string>(TOKEN_NAME);

      const client = createClient();
      client.auth.loginCreate(user).then(response => {
        const r = response.data as unknown as AuthInfo;
        if (r.token) {
          setCookie(TOKEN_NAME, r.token);
          return resolve(token);
        } else {
          return reject("token not found");
        }
      }).catch(reject);
    });
  }

  static logout() {
    const token = removeCookie(TOKEN_NAME);
  }

  static getToken() {
    const token = getCookie<string>(TOKEN_NAME);
    return token;
  }

  static isLoggedIn() {
    const token = getCookie<string>(TOKEN_NAME);
    return token !== null;
  }

  static signup(user: RequestsAuthenticationRequest) {
    const client = createClient();
    return client.auth.signupCreate(user);
  }

  static getAuthHeader(): AuthHeader | null {
    const token = getCookie<string>(TOKEN_NAME);
    if (!token) {
      return null;
    }

    return { Authorization: 'Bearer ' + token };
  }
}