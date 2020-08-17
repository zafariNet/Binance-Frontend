import { Component, Injector, ViewEncapsulation } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { PageTitleService } from '@app/shared/layout/nav/pageTitleService';

@Component({
    templateUrl: './host-dashboard.component.html',
    styleUrls: ['./host-dashboard.component.less'],
    encapsulation: ViewEncapsulation.None,
})
export class HostDashboardComponent extends AppComponentBase {
    constructor(
        injector: Injector,
        private _pageTitleService: PageTitleService
    ) {
        super(injector);
        this._pageTitleService.pageTitle = 'داشبورد';
        this._pageTitleService.pageDescription = 'اطلاعات آماری';
    }
}
