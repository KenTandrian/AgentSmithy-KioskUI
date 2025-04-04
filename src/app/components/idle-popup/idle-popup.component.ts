import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-idle-popup',
  templateUrl: './idle-popup.component.html',
  styleUrl: './idle-popup.component.scss'
})
export class IdlePopupComponent {
  constructor(
    public dialogRef: MatDialogRef<IdlePopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  onNoClick(): void {
    this.dialogRef.close(false); // User did not respond or clicked "No"
  }

  onYesClick(): void {
    this.dialogRef.close(true); // User clicked "Yes"
  }
}