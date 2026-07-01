import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';

interface FeatureData {
  eyebrow: string;
  title: string;
  description: string;
  status: string;
}

@Component({
  selector: 'app-feature-placeholder',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './feature-placeholder.html',
  styleUrl: './feature-placeholder.scss',
})
export class FeaturePlaceholder {
  private readonly route = inject(ActivatedRoute);
  private readonly authService = inject(AuthService);

  readonly usuario = this.authService.usuario;
  readonly data = computed<FeatureData>(() => ({
    eyebrow: this.route.snapshot.data['eyebrow'] as string,
    title: this.route.snapshot.data['title'] as string,
    description: this.route.snapshot.data['description'] as string,
    status: this.route.snapshot.data['status'] as string,
  }));
}
