import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicStorageModule } from '@ionic/storage';
import { ScreenOrientation } from '@ionic-native/screen-orientation';
import { LocalNotifications } from '@ionic-native/local-notifications';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';
import { Home } from '../pages/home/home';
import { Form } from '../pages/form/form';
import { Agenda } from '../pages/agenda/agenda';
import { About } from '../pages/about/about';
import { Settings } from '../pages/settings/settings';

import { DataProvider } from '../providers/dataProvider';
import { DbProvider } from '../providers/dbProvider';
import { MigrationProvider } from '../providers/migrationProvider';

@NgModule({
  declarations: [
    MyApp,
    Home,
    Form,
    Agenda,
    Settings,
    About
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot()
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    Home,
    Form,
    Agenda,
    Settings,
    About
  ],
  providers: [
    DataProvider,
    DbProvider,
    MigrationProvider,
    ScreenOrientation,
    LocalNotifications,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
