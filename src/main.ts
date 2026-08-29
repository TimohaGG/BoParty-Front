import {bootstrapApplication} from "@angular/platform-browser";
import {AppComponent} from "./app/app.component";
import {appConfig} from "./app/app.config";
import {registerLocaleData} from "@angular/common";
import localeUk from '@angular/common/locales/uk';


registerLocaleData(localeUk)
bootstrapApplication(AppComponent, appConfig)
  .catch(() => undefined);
