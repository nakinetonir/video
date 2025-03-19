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
        video: { facingMode: 'user', width: { max: 640 }, height: { max: 480 } },
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
    // En Safari, el mimeType debe ser 'video/mp4; codecs="avc1.64001E, mp4a.40.2"'
    // para que el video se pueda grabar correctamente. En Chrome, el mimeType
    // debe ser 'video/webm; codecs="vp8,opus"'. Si no se especifica el mimeType,
    // Safari devuelve un error.
    const mediaType = navigator.userAgent.indexOf('Safari') !== -1 && navigator.userAgent.indexOf('Chrome') === -1
      ? 'video/mp4; codecs="avc1.64001E, mp4a.40.2"'
      : 'video/webm; codecs="vp8,opus"';
    // Creamos un objeto MediaRecorder que se encargue de grabar el video
    try {
      this.mediaRecorder = new MediaRecorder(this.videoStream, { mimeType: mediaType });
    } catch (error) {
      alert('Error creating MediaRecorder: ' + error);  
      console.error('Error creating MediaRecorder:', error);
    }    

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.recordedChunks.push(event.data);
      }
    };
    this.mediaRecorder.onstop = () => {
      this.videoBlob = new Blob(this.recordedChunks, { type: mediaType });
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
