import { NgModule, ErrorHandler } from '@angular/core';
import { Storage } from '@ionic/storage';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';
import { Home } from '../pages/home/home';
import { Form } from '../pages/form/form';
import { Agenda } from '../pages/agenda/agenda';

import { DataProvider } from '../providers/dataProvider';
import { DbProvider } from '../providers/dbProvider';
import { MigrationProvider } from '../providers/migrationProvider';

@NgModule({
  declarations: [
    MyApp,
    Home,
    Form,
    Agenda
  ],
  imports: [
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    Home,
    Form,
    Agenda
  ],
  providers: [
    Storage,
    DataProvider,
    DbProvider,
    MigrationProvider,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
