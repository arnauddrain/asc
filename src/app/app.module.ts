import { NgModule, ErrorHandler } from '@angular/core';
import { Storage } from '@ionic/storage';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';
import { Home } from '../pages/home/home';
import { Form } from '../pages/form/form';

import { DbProvider } from '../providers/dbProvider';
import { DataProvider } from '../providers/dataProvider';
import { MigrationProvider } from '../providers/migrationProvider';

@NgModule({
  declarations: [
    MyApp,
    Home,
    Form
  ],
  imports: [
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    Home,
    Form
  ],
  providers: [
    Storage,
    DbProvider,
    DataProvider,
    MigrationProvider,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
