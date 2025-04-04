import { Component, inject } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { ThemeService } from '../../services/theme.service';
import { Analytics, logEvent } from "@angular/fire/analytics";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  private analytics = inject(Analytics);

constructor(public router: Router, private domSanitizer: DomSanitizer, private matIconRegistry: MatIconRegistry, private themeService: ThemeService) {
  logEvent(this.analytics, "/home");
  localStorage.removeItem("agentData");
  this.matIconRegistry.addSvgIcon(
    'spark',
    this.domSanitizer.bypassSecurityTrustResourceUrl('/assets/images/spark.svg')
  );

  this.matIconRegistry.addSvgIcon(
    'spark-dark',
    this.domSanitizer.bypassSecurityTrustResourceUrl('/assets/images/spark-dark.svg')
  );

  this.matIconRegistry.addSvgIcon(
    'spark-shine',
    this.domSanitizer.bypassSecurityTrustResourceUrl('/assets/images/spark-shine.svg')
  );

  this.matIconRegistry.addSvgIcon(
    'spark-shine-dark',
    this.domSanitizer.bypassSecurityTrustResourceUrl('/assets/images/spark-shine-dark.svg')
  );

}

  routeToCreateBot(templateId?: string) {
    logEvent(this.analytics, '/home/build_an_agent');
    if (templateId)
      this.router.navigate(["create-bot/" + templateId]);
    else
      this.router.navigate(["create-bot"])
  }

  routeToPrebuiltBot(templateId?: string) {
    if (templateId)
      this.router.navigate(["predefined-bot/" + templateId]);
    else
      this.router.navigate(["predefined-bot"])
  }

  get isDarkTheme(): boolean {
    return this.themeService.getIsDarkTheme();
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}
