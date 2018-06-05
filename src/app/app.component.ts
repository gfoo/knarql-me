import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, isDevMode } from '@angular/core';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/timeout';
import { parseURL } from 'universal-parse-url';

const {
  version: appVersionLoaded,
  homepage: appHomepageLoaded
} = require('../../package.json');

@Component({
  selector: 'kme-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  appVersion: string = appVersionLoaded;
  appHomePage: string = appHomepageLoaded;
  devMode: string = isDevMode() ? ' in dev mode' : ' in prod mode';

  endpoint = 'http://localhost:3333/v2/searchextended/';
  knarql = `PREFIX knora-api: <http://api.knora.org/ontology/knora-api/simple/v2#>
PREFIX ll: <http://0.0.0.0:3333/ontology/0113/lumieres-lausanne/simple/v2#>
CONSTRUCT {
  ?s knora-api:isMainResource true .
} WHERE {
  ?s a knora-api:Resource .
  ?s a ll:FreeContent .
}`;

  availableMethods = ['POST sparql-query', 'GET'];
  httpMethod;

  isLaunched = false;
  jsonResult = null;
  rawResult = null;

  login;
  password;
  isLogLaunched = false;
  token;

  constructor(private http: HttpClient) {}

  getMethod(headers: HttpHeaders) {
    this.jsonResult = null;
    this.rawResult = null;
    this.isLaunched = true;
    this.http
      .get(
        this.endpoint +
          (!this.endpoint.endsWith('/') ? '/' : '') +
          encodeURIComponent(this.knarql),
        {
          headers: headers
        }
      )
      //.delay(3000)
      .timeout(30000)
      .subscribe(
        res => {
          this.jsonResult = res;
          this.rawResult = JSON.stringify(res, null, 2);
          this.isLaunched = false;
        },
        error => {
          this.jsonResult = error;
          this.rawResult = JSON.stringify(error, null, 2);
          this.isLaunched = false;
          console.error(error);
        }
      );
  }

  postMethod(headers: HttpHeaders, payload) {
    this.jsonResult = null;
    this.rawResult = null;
    this.isLaunched = true;

    let url = this.endpoint.trim();
    url = url.endsWith('/') ? url.substring(0, url.length - 1) : url;

    this.http
      .post(url, payload, {
        headers: headers
      })
      //.delay(3000)
      .timeout(30000)
      .subscribe(
        res => {
          this.jsonResult = res;
          this.rawResult = JSON.stringify(res, null, 2);
          this.isLaunched = false;
        },
        error => {
          this.jsonResult = error;
          this.rawResult = JSON.stringify(error, null, 2);
          this.isLaunched = false;
          console.error(error);
        }
      );
  }

  postSparqlMethod(headers: HttpHeaders) {
    headers = headers.set('Content-Type', 'application/sparql-query');
    this.postMethod(headers, this.knarql);
  }

  onLaunch() {
    let headers = new HttpHeaders({});
    if (this.token) {
      headers = headers.set('Authorization', 'Bearer ' + this.token);
    }

    switch (this.httpMethod) {
      case 'GET': {
        this.getMethod(headers);
        break;
      }
      case 'POST sparql-query': {
        this.postSparqlMethod(headers);
        break;
      }
    }
  }

  signout(authURL) {
    this.isLogLaunched = true;
    this.http
      .delete(authURL, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + this.token
        })
      })
      .subscribe(
        res => {
          this.token = null;
          this.isLogLaunched = false;
        },
        error => {
          this.token = null;
          this.isLogLaunched = false;
          window.alert(error.message);
          console.error(error);
        }
      );
  }

  signin(authURL) {
    this.isLogLaunched = true;
    this.http
      .post(authURL, {
        email: this.login,
        password: this.password
      })
      .subscribe(
        (res: any) => {
          this.token = res.token;
          this.isLogLaunched = false;
        },
        error => {
          this.token = null;
          this.isLogLaunched = false;
          window.alert(error.message);
          console.error(error);
        }
      );
  }

  connection() {
    const url = parseURL(this.endpoint);
    const authURL = url.protocol + '//' + url.host + '/' + 'v2/authentication';
    if (this.token) {
      this.signout(authURL);
    } else {
      this.signin(authURL);
    }
  }
}
