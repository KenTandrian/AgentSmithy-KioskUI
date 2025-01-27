import { Component } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';


const PRIVACY_POLICY_URL = "https://policies.google.com/privacy?hl=en-US";

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {

  constructor(public router: Router, private domSanitizer: DomSanitizer, private matIconRegistry: MatIconRegistry) { 
  
    this.matIconRegistry.addSvgIcon(
      'home',
      this.domSanitizer.bypassSecurityTrustResourceUrl('assets/images/home.svg')
    );
  
    this.matIconRegistry.addSvgIcon(
      'spark-shine',
      this.domSanitizer.bypassSecurityTrustResourceUrl('assets/images/spark-shine.svg')
    );
  
  }
}
