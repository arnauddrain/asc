import { ErrorHandler, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { EmailComposer } from '@ionic-native/email-composer';
import { GoogleAnalytics } from '@ionic-native/google-analytics';
import { LocalNotifications } from '@ionic-native/local-notifications';
import { ScreenOrientation } from '@ionic-native/screen-orientation';
import { SplashScreen } from '@ionic-native/splash-screen';
import { SQLite } from '@ionic-native/sqlite';
import { StatusBar } from '@ionic-native/status-bar';
import { IonicStorageModule } from '@ionic/storage';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';

import { About } from '../pages/about/about';
import { Agenda } from '../pages/agenda/agenda';
import { Form } from '../pages/form/form';
import { Home } from '../pages/home/home';
import { Settings } from '../pages/settings/settings';
import { OnlyNapesPipe } from '../pipes/onlyNapesPipe';
import { OnlyWakeupsPipe } from '../pipes/onlyWakeupsPipe';
import { DataProvider } from '../providers/dataProvider';
import { DbProvider } from '../providers/dbProvider';
import { MigrationProvider } from '../providers/migrationProvider';
import { NotificationsProvider } from '../providers/notificationsProvider';

import { MyApp } from './app.component';

@NgModule({
  declarations: [
    MyApp,
    Home,
    Form,
    Agenda,
    Settings,
    About,
    OnlyNapesPipe,
    OnlyWakeupsPipe,
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot(),
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    Home,
    Form,
    Agenda,
    Settings,
    About,
  ],
  providers: [
    DataProvider,
    DbProvider,
    MigrationProvider,
    NotificationsProvider,
    ScreenOrientation,
    LocalNotifications,
    { provide: ErrorHandler, useClass: IonicErrorHandler },
    SQLite,
    StatusBar,
    SplashScreen,
    GoogleAnalytics,
    EmailComposer,
  ],
})
export class AppModule {}
