import { async, TestBed } from '@angular/core/testing';
import { EmailComposer } from '@ionic-native/email-composer';
import { GoogleAnalytics } from '@ionic-native/google-analytics';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { Storage } from '@ionic/storage';
import { AlertController, Events, IonicModule, ModalController, Nav, Platform } from 'ionic-angular';

import { MyApp } from './app.component';
import { DataProvider } from '../providers/dataProvider';
import { DataProviderMock } from '../providers/dataProvider.mock';
import { NotificationsProvider } from '../providers/notificationsProvider';
import { NotificationsProviderMock } from '../providers/notificationsProvider.mock';
import {
  AlertControllerMock,
  EmailComposerMock,
  EventsMock,
  GoogleAnalyticsMock,
  PlatformMock,
  ModalControllerMock,
  NavMock,
  SplashScreenMock,
  StatusBarMock,
  StorageMock
} from '../../test-config/mocks-ionic';

describe('MyApp Component', () => {
  let fixture;
  let component;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MyApp],
      imports: [
        IonicModule.forRoot(MyApp)
      ],
      providers: [
        { provide: EmailComposer, useClass: EmailComposerMock },
        { provide: GoogleAnalytics, useClass: GoogleAnalyticsMock },
        { provide: SplashScreen, useClass: SplashScreenMock },
        { provide: StatusBar, useClass: StatusBarMock },
        { provide: Storage, useClass: StorageMock },
        { provide: AlertController, useClass: AlertControllerMock },
        { provide: Events, useClass: EventsMock },
        { provide: ModalController, useClass: ModalControllerMock },
        { provide: Nav, useClass: NavMock },
        { provide: Platform, useClass: PlatformMock },
        { provide: DataProvider, useClass: DataProviderMock },
        { provide: NotificationsProvider, useClass: NotificationsProviderMock }
      ]
    })
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MyApp);
    component = fixture.componentInstance;
  });

  it('should be created', () => {
    expect(component instanceof MyApp).toBe(true);
  });

  it('sleep should be true', () => {
    expect(component.sleep).toBe(true);
  });

});