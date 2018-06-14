import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, isDevMode } from '@angular/core';
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
  query = `PREFIX knora-api: <http://api.knora.org/ontology/knora-api/simple/v2#>
PREFIX onto: <http://0.0.0.0:3333/ontology/0001/anything/simple/v2#>
CONSTRUCT {
  ?s knora-api:isMainResource true .
} WHERE {
  ?s a knora-api:Resource .
  ?s a onto:Thing .
}`;

  availableMethods = ['POST sparql-query', 'GET'];
  httpMethod;
  acceptMethods = ['application/ld+json', 'application/rdf+xml', 'text/turtle'];
  acceptMethod;

  isLaunched = false;
  jsonResult = null;
  rawResult = null;

  login;
  password;
  isLogLaunched = false;
  token;

  constructor(private http: HttpClient) {}

  result(res) {
    // console.log('result:', res);
    if (this.acceptMethod === 'application/ld+json') {
      this.jsonResult = JSON.parse(res);
      this.rawResult = JSON.stringify(this.jsonResult, null, 2);
    } else {
      this.jsonResult = null;
      this.rawResult = res;
    }
    this.isLaunched = false;
  }

  error(error) {
    this.jsonResult = null;
    this.rawResult = 'ERROR:' + error;
    this.isLaunched = false;
    console.error(error);
  }

  getMethod(headers: HttpHeaders) {
    this.jsonResult = null;
    this.rawResult = null;
    this.isLaunched = true;
    this.http
      .get(
        this.endpoint +
          (!this.endpoint.endsWith('/') ? '/' : '') +
          encodeURIComponent(this.query),
        {
          headers: headers,
          responseType: 'text'
        }
      )
      .subscribe(this.result.bind(this), this.error.bind(this));
  }

  postMethod(headers: HttpHeaders, payload) {
    this.jsonResult = null;
    this.rawResult = null;
    this.isLaunched = true;
    let url = this.endpoint.trim();
    url = url.endsWith('/') ? url.substring(0, url.length - 1) : url;
    this.http
      .post(url, payload, {
        headers: headers,
        responseType: 'text'
      })
      .subscribe(this.result.bind(this), this.error.bind(this));
  }

  postSparqlMethod(headers: HttpHeaders) {
    headers = headers.set('Content-Type', 'application/sparql-query');
    this.postMethod(headers, this.query);
  }

  onLaunch() {
    let headers = new HttpHeaders({});
    headers = headers.set('Accept', this.acceptMethod);
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
