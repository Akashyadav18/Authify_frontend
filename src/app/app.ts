import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastContainerComponent } from './shared/components/toast/toast-container.component';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastContainerComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  constructor(private http: HttpClient) {}

  private apiUrl = environment.apiBaseUrl;

  ngOnInit() {
    this.wakeUpBackend();
  }

  wakeUpBackend() {
    this.http.get(`${this.apiUrl}/ping`)
      .subscribe({
        next: () => console.log('Backend is awake ✅'),
        error: () => console.log('Backend waking up... ⏳')
      });
  }
}
