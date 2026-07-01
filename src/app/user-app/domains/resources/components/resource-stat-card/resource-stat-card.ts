import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-resource-stat-card',
  standalone: true,
  templateUrl: './resource-stat-card.html',
  styleUrl: './resource-stat-card.scss',
})
export class ResourceStatCard {
  @Input({ required: true }) label = '';
  @Input({ required: true }) value = '';
  @Input() detail = '';
  @Input() tone: 'neutral' | 'warning' | 'danger' = 'neutral';
}
