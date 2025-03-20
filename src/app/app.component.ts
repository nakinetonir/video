import { Component, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';  // <-- Importa HttpClientModule


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, HttpClientModule,  RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  @ViewChild('preview', { static: false }) preview!: ElementRef<HTMLVideoElement>;
  mediaRecorder!: MediaRecorder;
  recordedChunks: Blob[] = [];
  isRecording = false;
  videoURL: string | null = null;
  videoId: string | null = null;

  constructor(private http: HttpClient, private cdr:  ChangeDetectorRef) {}

  startCamera() {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
      this.preview.nativeElement.srcObject = stream;
    });
  }

  startRecording() {
    this.recordedChunks = [];
    this.isRecording = true;
    const stream = this.preview.nativeElement.srcObject as MediaStream;
    this.mediaRecorder = new MediaRecorder(stream);
    
    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.recordedChunks.push(event.data);
      }
    };

    this.mediaRecorder.onstop = () => {
      const blob = new Blob(this.recordedChunks, { type: 'video/webm' });
      this.uploadVideo(blob);
    };

    this.mediaRecorder.start();
  }

  stopRecording() {
    this.isRecording = false;
    this.mediaRecorder.stop();
  }

  uploadVideo(blob: Blob) {
    const formData = new FormData();
    formData.append('video', blob, 'video.webm');

    this.http.post<{ message: string; videoId: string }>('https://videoback-two.vercel.app/upload', formData).subscribe((response) => {
      debugger
      this.videoId = response.videoId;
      this.cdr.detectChanges();
      alert('Video subido con éxito');
    });
  }

  fetchVideo() {
    if (!this.videoId) return;
    this.videoURL = `https://videoback-two.vercel.app/video/${this.videoId}`;
  }
}