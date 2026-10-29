import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar.component';
import { BottomNavComponent } from './shared/components/bottom-nav.component';
import { ToastComponent } from './shared/components/toast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, BottomNavComponent, ToastComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  // Mobile handset frame preview toggle (desktop users can toggle between full width and phone mockup)
  isHandsetView = signal<boolean>(false);

  toggleHandsetView() {
    this.isHandsetView.update(v => !v);
  }
}
