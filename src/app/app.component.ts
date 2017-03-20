import { Component, ViewChild } from '@angular/core';
import { Nav, Platform } from 'ionic-angular';
import { StatusBar, Splashscreen  } from 'ionic-native';

import { Home } from '../pages/home/home';
import { DataProvider } from '../providers/dataProvider';
import { Addiction } from '../entities/addiction';

@Component({
	templateUrl: 'app.html'
})
export class MyApp {
	@ViewChild(Nav) nav: Nav;

	rootPage: any = Home;


	addictions: Addiction[] = [];

 	constructor(public platform: Platform, private dataProvider: DataProvider) {
	    this.platform.ready().then(() => {
			StatusBar.styleDefault();
			Splashscreen.hide();
			this.dataProvider.getAddictions()
				.then((addictions) => this.addictions = addictions)
				.catch((err) => console.log(err));
    	});
 	}

	infoChange(addiction: Addiction) {

		this.dataProvider.setAddiction(addiction.id, addiction.activated);
  		//NativeStorage.setItem(info.title, info.activated);
  	}

  	openPage(page) {
		// Reset the content nav to have just this page
		// we wouldn't want the back button to show in this scenario
	    this.nav.setRoot(page.component);
  	}
}
