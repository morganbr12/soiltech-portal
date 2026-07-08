import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="auth-layout">
      <div class="auth-layout__bg">
        <div class="auth-bg-pattern"></div>
        <div class="auth-bg-content">
          <div class="auth-brand">
            <div class="brand-logo">
              <img src="/icons/soiltech-logo.jpeg" alt="SoilTech" class="brand-logo-img" />
            </div>
            <h1 class="brand-title">SoilTech Portal</h1>
            <p class="brand-subtitle">Agricultural Supply Chain Management</p>
          </div>

          <div class="auth-features">
            @for (feature of features; track feature.icon) {
              <div class="feature-item">
                <div class="feature-icon">
                  <span class="material-symbols-rounded">{{ feature.icon }}</span>
                </div>
                <div>
                  <h3>{{ feature.title }}</h3>
                  <p>{{ feature.desc }}</p>
                </div>
              </div>
            }
          </div>
        </div>
      </div>

      <div class="auth-layout__form">
        <router-outlet />
      </div>
    </div>
  `,
  styles: [`
    .auth-layout {
      display: flex;
      min-height: 100vh;
    }

    .auth-layout__bg {
      flex: 1 1 50%;
      background: linear-gradient(135deg, var(--color-primary-dark) 0%, var(--color-primary) 50%, var(--color-primary-light) 100%);
      position: relative;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 48px;

      @media (max-width: 1024px) { display: none; }
    }

    .auth-bg-pattern {
      position: absolute;
      inset: 0;
      background-image:
        radial-gradient(circle at 20% 20%, rgba(255,255,255,0.08) 0%, transparent 50%),
        radial-gradient(circle at 80% 80%, rgba(255,255,255,0.05) 0%, transparent 50%),
        url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
    }

    .auth-bg-content {
      position: relative;
      z-index: 1;
      color: white;
      max-width: 400px;
    }

    .auth-brand { margin-bottom: 48px; }

    .brand-logo {
      width: 80px;
      height: 80px;
      background: white;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 16px;
      overflow: hidden;
      box-shadow: 0 4px 16px rgba(0,0,0,0.15);
    }

    .brand-logo-img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      display: block;
    }

    .brand-title {
      font-size: 2rem;
      font-weight: 800;
      color: white;
      letter-spacing: -0.03em;
      margin-bottom: 8px;
    }

    .brand-subtitle {
      font-size: 1rem;
      color: rgba(255,255,255,0.7);
    }

    .auth-features {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .feature-item {
      display: flex;
      align-items: flex-start;
      gap: 14px;

      h3 {
        font-size: 0.9375rem;
        font-weight: 600;
        color: white;
        margin-bottom: 2px;
      }

      p {
        font-size: 0.8125rem;
        color: rgba(255,255,255,0.65);
        line-height: 1.4;
      }
    }

    .feature-icon {
      width: 40px;
      height: 40px;
      background: rgba(255,255,255,0.15);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;

      span { color: white; font-size: 20px; }
    }

    .auth-layout__form {
      flex: 1 1 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 48px 32px;
      background: var(--color-bg);

      @media (max-width: 1024px) { flex: 1 1 100%; }
    }
  `]
})
export class AuthLayoutComponent {
  readonly features = [
    { icon: 'agriculture', title: 'LBC & Agent Management', desc: 'Manage Licensed Buying Companies and field agents across all regions' },
    { icon: 'local_shipping', title: 'Live Logistics Tracking', desc: 'Real-time GPS tracking of drivers, vehicles and deliveries' },
    { icon: 'warehouse', title: 'Warehouse & Inventory', desc: 'Complete warehouse operations and produce inventory management' },
    { icon: 'insights', title: 'Analytics & Reports', desc: 'Powerful dashboards and exportable reports for all operations' },
  ];
}
