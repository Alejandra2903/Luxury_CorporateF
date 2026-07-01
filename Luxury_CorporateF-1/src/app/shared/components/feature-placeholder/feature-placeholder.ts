import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';

import { AuthService } from '../../../core/services/auth.service';
import { Usuario } from '../../../core/models/usuario.model';

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
export class FeaturePlaceholder implements OnInit, OnDestroy {
  private sub = new Subscription();
  usuario: Usuario | null = null;
  data!: FeatureData;

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.sub.add(this.authService.usuario$.subscribe(u => this.usuario = u));
    
    this.data = {
      eyebrow: this.route.snapshot.data['eyebrow'] as string,
      title: this.route.snapshot.data['title'] as string,
      description: this.route.snapshot.data['description'] as string,
      status: this.route.snapshot.data['status'] as string,
    };
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
