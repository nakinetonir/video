import { Component, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';

import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  @ViewChild('preview') previewVideoElement!: ElementRef;
  videoStream!: MediaStream;
  mediaRecorder!: MediaRecorder;
  recordedChunks: Blob[] = [];
  videoBlob!: Blob;
  videoURL: string = '';
  isRecording: boolean = false;

  constructor(private cdr: ChangeDetectorRef) {}

  async startCamera() {
    try {
      this.videoStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true,
      });
      const previewVideo = this.previewVideoElement.nativeElement;
      previewVideo.srcObject = this.videoStream;
      previewVideo.play();
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  }

  startRecording() {
    this.recordedChunks = [];
    this.mediaRecorder = new MediaRecorder(this.videoStream);
    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.recordedChunks.push(event.data);
      }
    };
    this.mediaRecorder.onstop = () => {
      this.videoBlob = new Blob(this.recordedChunks, { type: 'video/webm' });
      this.videoURL = URL.createObjectURL(this.videoBlob);
      this.cdr.detectChanges();
    };
    this.mediaRecorder.start();
    this.isRecording = true;
  }

  stopRecording() {
    if (this.mediaRecorder) {
      this.mediaRecorder.stop();
      this.isRecording = false;
    }
  }

  downloadVideo() {
    const a = document.createElement('a');
    a.href = this.videoURL;
    a.download = 'recorded-video.webm';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
}
