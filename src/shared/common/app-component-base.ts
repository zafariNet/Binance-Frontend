import {
    PermissionCheckerService,
    FeatureCheckerService,
    LocalizationService,
    MessageService,
    AbpMultiTenancyService,
    NotifyService,
    SettingService,
} from 'abp-ng2-module';
import { Component, Injector, AfterViewInit } from '@angular/core';
import { AppConsts } from '@shared/AppConsts';
import { AppUrlService } from '@shared/common/nav/app-url.service';
import { AppSessionService } from '@shared/common/session/app-session.service';
import { AppUiCustomizationService } from '@shared/common/ui/app-ui-customization.service';
import { PrimengTableHelper } from 'shared/helpers/PrimengTableHelper';
import { UiCustomizationSettingsDto } from '@shared/service-proxies/service-proxies';
import { NgxSpinnerService } from 'ngx-spinner';
import { NgxSpinnerTextService } from '@app/shared/ngx-spinner-text.service';
import { totalmem } from 'os';
declare var $:any;
export abstract class AppComponentBase implements AfterViewInit {
    localizationSourceName =
        AppConsts.localization.defaultLocalizationSourceName;

    localization: LocalizationService;
    permission: PermissionCheckerService;
    feature: FeatureCheckerService;
    notify: NotifyService;
    setting: SettingService;
    message: MessageService;
    multiTenancy: AbpMultiTenancyService;
    appSession: AppSessionService;
    primengTableHelper: PrimengTableHelper;
    ui: AppUiCustomizationService;
    appUrlService: AppUrlService;
    spinnerService: NgxSpinnerService;
    private ngxSpinnerTextService: NgxSpinnerTextService;
    pageTitle = '';
    pager: any = {};
    pageCounts=[5,10,20,30,50,100,200,300,500,750,1000];
    paginationConfig: any = {
        itemsPerPage: 5,
        currentPage: 1,
        totalItems: 0,
        skip: () => {
            let result;
            if (this.paginationConfig.currentPage != 0) {
                result =
                    this.paginationConfig.itemsPerPage *
                    (this.paginationConfig.currentPage - 1);
            } else {
                result =
                    this.paginationConfig.itemsPerPage *
                    this.paginationConfig.currentPage;
            }
            if (result >= this.paginationConfig.totalItems) {
                return result - this.paginationConfig.totalItems;
            }
            return result;
        },
    };

    constructor(injector: Injector) {
        this.localization = injector.get(LocalizationService);
        this.permission = injector.get(PermissionCheckerService);
        this.feature = injector.get(FeatureCheckerService);
        this.notify = injector.get(NotifyService);
        this.setting = injector.get(SettingService);
        this.message = injector.get(MessageService);
        this.multiTenancy = injector.get(AbpMultiTenancyService);
        this.appSession = injector.get(AppSessionService);
        this.ui = injector.get(AppUiCustomizationService);
        this.appUrlService = injector.get(AppUrlService);
        this.primengTableHelper = new PrimengTableHelper();
        this.spinnerService = injector.get(NgxSpinnerService);
        this.ngxSpinnerTextService = injector.get(NgxSpinnerTextService);
    }
    ngAfterViewInit(): void {

        // Initialize
        $('.form-input-styled').uniform();

    }
    callMethodByName(event) {
        let methodName = event.methodName;
        if(this[methodName]) {
            // method exists on the component
            let param = event.methodParam;
            this[methodName](param); // call it
        }
    }
    flattenDeep(array) {
        return array.reduce(
            (acc, val) =>
                Array.isArray(val)
                    ? acc.concat(this.flattenDeep(val))
                    : acc.concat(val),
            []
        );
    }

    l(key: string, ...args: any[]): string {
        args.unshift(key);
        args.unshift(this.localizationSourceName);
        return this.ls.apply(this, args);
    }

    ls(sourcename: string, key: string, ...args: any[]): string {
        let localizedText = this.localization.localize(key, sourcename);

        if (!localizedText) {
            localizedText = key;
        }

        if (!args || !args.length) {
            return localizedText;
        }

        args.unshift(localizedText);
        return abp.utils.formatString.apply(this, this.flattenDeep(args));
    }

    isGranted(permissionName: string): boolean {
        return this.permission.isGranted(permissionName);
    }

    isGrantedAny(...permissions: string[]): boolean {
        if (!permissions) {
            return false;
        }

        for (const permission of permissions) {
            if (this.isGranted(permission)) {
                return true;
            }
        }

        return false;
    }

    s(key: string): string {
        return abp.setting.get(key);
    }

    appRootUrl(): string {
        return this.appUrlService.appRootUrl;
    }

    get currentTheme(): UiCustomizationSettingsDto {
        return this.appSession.theme;
    }

    get containerClass(): string {
        if (this.appSession.theme.baseSettings.layout.layoutType === 'fluid') {
            return 'container-fluid';
        }

        return 'container';
    }

    showMainSpinner(text?: string): void {
        this.ngxSpinnerTextService.currentText = text;
        this.spinnerService.show();
    }

    hideMainSpinner(text?: string): void {
        this.spinnerService.hide();
    }
}
