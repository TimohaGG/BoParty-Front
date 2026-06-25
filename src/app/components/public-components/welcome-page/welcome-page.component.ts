import {Component} from '@angular/core';
import {MatAnchor} from "@angular/material/button";
import {MatIcon} from "@angular/material/icon";
import {RouterLink} from "@angular/router";

@Component({
  selector: 'app-welcome-page',
  standalone: true,
  imports: [
    MatAnchor,
    MatIcon,
    RouterLink
  ],
  templateUrl: './welcome-page.component.html',
  styleUrl: './welcome-page.component.css'
})
export class WelcomePageComponent {
  activePhotoIndex = 0;
  activeVideoIndex = 0;

  readonly media = {
    videos: [
      '/assets/welcome-media/df03d92e87b74ea7b733ff6503043c80.mov',
      '/assets/welcome-media/dc9f4c0ff1e44734b107e9c33356d6fb.mov',
      '/assets/welcome-media/47434b98b5cb4fb6b2402a7a6da3c7cf.mov',
      '/assets/welcome-media/33f42a9c5d1c4eedab9c6fc04a6c111b.mov',
      '/assets/welcome-media/81c0f3658b8b4fcaadef1f17115c729b.mov',
    ],
    photos: [
      '/assets/welcome-media/IMG_3704.jpg',
      '/assets/welcome-media/IMG_3703.jpg',
      '/assets/welcome-media/IMG_3695.jpg',
      '/assets/welcome-media/IMG_3696.jpg',
      '/assets/welcome-media/IMG_3697.jpg',
      '/assets/welcome-media/IMG_3698.jpg',
      '/assets/welcome-media/IMG_3699.jpg',
    ]
  };

  readonly offers = [
    {
      title: 'Замовлення з декором',
      price: 'від 7000 грн',
      description: 'Фінальна вартість узгоджується після контакту з менеджером та залежить від формату події.'
    },
    {
      title: 'Замовлення в боксах',
      price: 'мін. 5000 грн',
      description: 'Оберіть готовий формат боксу та зберіть меню під вашу подію.'
    },
    {
      title: 'Кастомний бокс',
      price: 'від 10 шт кожної позиції',
      description: 'Підійде, якщо потрібно власне наповнення і чітка кількість по кожній позиції.'
    }
  ];

  readonly decorations = [
    'Столи',
    'Підставки',
    'Текстиль',
    'Декор'
  ];

  readonly services = [
    'Офіціант',
    'Кейтеринг',
    'Монтаж декору',
    'Каво-брейки',
    'Ланчі в боксах'
  ];

  showPreviousPhoto(): void {
    const totalPhotos = this.media.photos.length;
    this.activePhotoIndex = (this.activePhotoIndex - 1 + totalPhotos) % totalPhotos;
  }

  showNextPhoto(): void {
    const totalPhotos = this.media.photos.length;
    this.activePhotoIndex = (this.activePhotoIndex + 1) % totalPhotos;
  }

  selectPhoto(index: number): void {
    this.activePhotoIndex = index;
  }

  selectVideo(index: number): void {
    this.activeVideoIndex = index;
  }

  showPreviousVideo(): void {
    const totalVideos = this.media.videos.length;
    this.activeVideoIndex = (this.activeVideoIndex - 1 + totalVideos) % totalVideos;
  }

  showNextVideo(): void {
    const totalVideos = this.media.videos.length;
    this.activeVideoIndex = (this.activeVideoIndex + 1) % totalVideos;
  }
}
