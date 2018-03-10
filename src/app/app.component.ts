import { Component, isDevMode } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/delay';

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
  isLaunched = false;

  jsonResult = null;
  rawResult = null;

  constructor(private http: HttpClient) {}

  onSubmit() {
    this.jsonResult = null;
    this.rawResult = null;
    this.isLaunched = true;
    this.http
      .get(
        this.endpoint +
          (!this.endpoint.endsWith('/') ? '/' : '') +
          encodeURIComponent(this.knarql)
      )
      //  .delay(3000)
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
        }
      );
  }
}
