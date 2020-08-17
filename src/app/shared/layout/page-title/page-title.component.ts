import { Component, OnInit, Injector } from '@angular/core';
import {
    ActivatedRoute,
    Router,
    NavigationStart,
    NavigationEnd,
    NavigationError,
    ActivatedRouteSnapshot,
} from '@angular/router';
import { AppComponentBase } from '@shared/common/app-component-base';
import { PageTitleService } from '../nav/pageTitleService';

@Component({
    selector: 'app-page-title',
    templateUrl: './page-title.component.html',
    styleUrls: ['./page-title.component.css'],
})
export class PageTitleComponent extends AppComponentBase implements OnInit {
    pageTitleService: any;
    constructor(
        injector: Injector,
        private _pageTitleService: PageTitleService
    ) {
        super(injector);
        this.pageTitleService = this._pageTitleService;
    }
    title = undefined;
    ngOnInit(): void {}
}
