import { Component, ViewChild } from '@angular/core';
import { Nav, Platform, Events } from 'ionic-angular';
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

 	constructor(public platform: Platform, private dataProvider: DataProvider, public events: Events) {
	    this.platform.ready().then(() => {
			StatusBar.styleDefault();
			Splashscreen.hide();
			this.dataProvider.getAddictions()
				.then((addictions) => this.addictions = addictions)
				.catch((err) => console.log(err));
    	});
 	}

	infoChange(addiction: Addiction) {
		this.dataProvider.setAddiction(addiction.id, addiction.activated).then(() => {
			this.events.publish('addictions:updated');
		});
  	}
}
