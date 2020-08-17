import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { AppUrlService } from './nav/app-url.service';
import { AppUiCustomizationService } from './ui/app-ui-customization.service';
import { AppSessionService } from './session/app-session.service';
import { CookieConsentService } from './session/cookie-consent.service';
import { PageTitleService } from '@app/shared/layout/nav/pageTitleService';

@NgModule({
    imports: [
        CommonModule
    ]
})
export class AbpZeroTemplateCommonModule {
    static forRoot(): ModuleWithProviders<CommonModule> {
        return {
            ngModule: CommonModule,
            providers: [
                AppUiCustomizationService,
                CookieConsentService,
                AppSessionService,
                AppUrlService,
                PageTitleService
            ]
        };
    }
}
