import { Component } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';

@Component({
  selector: 'app-export',
  templateUrl: './export.component.html',
  styleUrl: './export.component.scss'
})
export class ExportComponent {
  constructor(public router: Router, private domSanitizer: DomSanitizer, private matIconRegistry: MatIconRegistry) { 

  }
  
    export() {
      
    }
  
    startAgain() {
        this.router.navigate(["/"])
    }
}
