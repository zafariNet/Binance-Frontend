import { Component, Injector, ViewEncapsulation } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
@Component({
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.less'],
    encapsulation: ViewEncapsulation.None
})

export class DashboardComponent extends AppComponentBase {


    constructor(
        injector: Injector) {
        super(injector);
    }
}
