import { Component, OnInit, OnDestroy, HostListener, PLATFORM_ID, Inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { IdlePopupComponent } from './components/idle-popup/idle-popup.component';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, OnDestroy {
  idleTime = 60000; // 60 seconds
  popupTimeoutTime = 20000; // 20 seconds
  idleTimer: any;
  popupTimeoutTimer: any;
  isIdle = false;
  dialogRef: any;
  isOnHomepage = false;

  constructor(
    private router: Router,
    private dialog: MatDialog,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.router.events
        .pipe(filter((event) => event instanceof NavigationEnd))
        .subscribe((event: NavigationEnd) => {
          this.isOnHomepage = event.urlAfterRedirects === '/' || event.urlAfterRedirects === '';
          this.resetIdleTimer();
        });

      this.resetIdleTimer();
    }
  }

  ngOnDestroy() {
    if (isPlatformBrowser(this.platformId)) {
      this.clearTimers();
    }
  }

  @HostListener('document:mousemove')
  @HostListener('document:keydown')
  resetIdleTimer() {
    if (isPlatformBrowser(this.platformId)) {
      this.isIdle = false;
      clearTimeout(this.idleTimer);

      if (!this.dialogRef && !this.isOnHomepage) {
        this.idleTimer = setTimeout(() => {
          this.isIdle = true;
          this.openIdlePopup();
        }, this.idleTime);
      }
    }
  }

  @HostListener('document:wheel')
  resetIdleTimerOnWheel() {
    if (isPlatformBrowser(this.platformId)) {
      if (this.dialogRef) {
        return; // Ignore activity if the dialog is open
      }
      this.resetIdleTimer(); // Call the main reset logic for consistency
    }
  }

  openIdlePopup() {
    if (isPlatformBrowser(this.platformId)) {
      this.dialogRef = this.dialog.open(IdlePopupComponent, {
        width: '300px',
        disableClose: true
      });

      this.popupTimeoutTimer = setTimeout(() => {
        if (this.dialogRef) {
          this.dialogRef.close(false);
          this.redirectToHomepage();
        }
      }, this.popupTimeoutTime);

      this.dialogRef.afterClosed().subscribe((result: boolean) => {
        clearTimeout(this.popupTimeoutTimer);
        this.dialogRef = null; // Clear dialogRef after it's closed
        if (result) {
          this.resetIdleTimer();
        } else {
          this.redirectToHomepage();
        }
      });
    }
  }

  redirectToHomepage() {
    if (isPlatformBrowser(this.platformId)) {
      this.router.navigate(['/']);
      // window.location.reload();
    }
  }

  clearTimers() {
    if (isPlatformBrowser(this.platformId)) {
      clearTimeout(this.idleTimer);
      clearTimeout(this.popupTimeoutTimer);
      if (this.dialogRef) {
        this.dialogRef.close();
        this.dialogRef = null;
      }
    }
  }
}