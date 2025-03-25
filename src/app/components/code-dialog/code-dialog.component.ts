import { Component, Inject, inject } from '@angular/core';
import {
  MatDialog,
  MAT_DIALOG_DATA,
  MatDialogTitle,
  MatDialogContent,
} from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-code-dialog',
  templateUrl: './code-dialog.component.html',
  styleUrl: './code-dialog.component.scss'
})
export class CodeDialogComponent {
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
