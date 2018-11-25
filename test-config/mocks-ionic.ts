export class AlertControllerMock {

}

export class PlatformMock {
  public ready(): Promise<string> {
    return new Promise((resolve) => {
      resolve('READY');
    });
  }

  public getQueryParam() {
    return true;
  }

  public registerBackButtonAction(fn: Function, priority?: number): Function {
    return (() => true);
  }

  public hasFocus(ele: HTMLElement): boolean {
    return true;
  }

  public doc(): HTMLDocument {
    return document;
  }

  public is(): boolean {
    return true;
  }

  public getElementComputedStyle(container: any): any {
    return {
      paddingLeft: '10',
      paddingTop: '10',
      paddingRight: '10',
      paddingBottom: '10',
    };
  }

  public onResize(callback: any) {
    return callback;
  }

  public registerListener(ele: any, eventName: string, callback: any): Function {
    return (() => true);
  }

  public win(): Window {
    return window;
  }

  public raf(callback: any): number {
    return 1;
  }

  public timeout(callback: any, timer: number): any {
    return setTimeout(callback, timer);
  }

  public cancelTimeout(id: any) {
    return;
  }

  public getActiveElement(): any {
    return document['activeElement'];
  }
}

export class NavMock {
}

export class EmailComposerMock {
  open() {
    return new Promise(resolve => {
      resolve();
    });
  }
}

export class EventsMock {

}

export class GoogleAnalyticsMock {
  startTrackerWithId() {
    return new Promise(resolve => {
      resolve();
    });
  }

  trackView() {
    return;
  }
}

export class ModalControllerMock {

}

export class SplashScreenMock {
  hide() {
    return;
  }
}

export class StatusBarMock {
  styleDefault() {
    return;
  }
}

export class StorageMock {
  get() {
    return new Promise(resolve => {
      resolve(null);
    })
  }

  set() {
    return new Promise(resolve => {
      resolve(null);
    })
  }
}