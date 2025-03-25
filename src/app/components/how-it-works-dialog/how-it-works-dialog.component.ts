import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-how-it-works-dialog',
  templateUrl: './how-it-works-dialog.component.html',
  styleUrl: './how-it-works-dialog.component.scss'
})
export class HowItWorksDialogComponent {
  sanitizedContent: SafeHtml;
  
    constructor(@Inject(MAT_DIALOG_DATA) public data: { content: string }, private sanitizer: DomSanitizer) {
      this.sanitizedContent = data.content;
      // console.log(this.sanitizedContent);
    }
  
    isImage(): boolean {
      // console.log(this.data.content);
      return this.data.content.toLowerCase().endsWith('.png') ||
             this.data.content.toLowerCase().endsWith('.jpg') ||
             this.data.content.toLowerCase().endsWith('.jpeg') ||
             this.data.content.toLowerCase().endsWith('.gif');
    }
}
