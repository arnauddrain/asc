import { Component } from '@angular/core';
import { ViewController } from 'ionic-angular';

@Component({
  selector: 'page-about',
  templateUrl: 'about.html',
})
export class About {
  constructor(public viewCtrl: ViewController) {}

  back() {
    this.viewCtrl.dismiss();
  }
}
