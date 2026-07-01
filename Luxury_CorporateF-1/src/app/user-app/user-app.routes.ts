import { Routes } from '@angular/router';


import { AppLayout } from './app-layout/app-layout';

export const USER_APP_ROUTES: Routes = [
  {
    path: '',
    component: AppLayout,
    children: [
      {
        path: 'dashboard',
        data: { roles: ['ADMIN', 'GERENTE', 'AUDITOR', 'ANALISTA'] },
        loadComponent: () =>
          import('./domains/dashboard/executive-dashboard/executive-dashboard').then(
            (m) => m.ExecutiveDashboard,
          ),
        title: 'Luxury - Dashboard',
      },
      {
        path: 'resources',
        data: {
          roles: ['ADMIN', 'ANALISTA', 'GERENTE', 'OPERADOR'],
        },
        loadComponent: () =>
          import('./domains/resources/pages/resources-overview/resources-overview').then(
            (m) => m.ResourcesOverview,
          ),
        title: 'Luxury - Recursos',
      },
      {
        path: 'resources/energy',
        data: {
          roles: ['ADMIN', 'ANALISTA', 'GERENTE', 'OPERADOR'],
        },
        loadComponent: () =>
          import('./domains/resources/pages/energy-consumption/energy-consumption').then(
            (m) => m.EnergyConsumption,
          ),
        title: 'Luxury - Energia',
      },
      {
        path: 'resources/water',
        data: {
          roles: ['ADMIN', 'ANALISTA', 'GERENTE', 'OPERADOR'],
        },
        loadComponent: () =>
          import('./domains/resources/pages/water-consumption/water-consumption').then(
            (m) => m.WaterConsumption,
          ),
        title: 'Luxury - Agua',
      },
      {
        path: 'resources/transactions',
        data: {
          roles: ['ADMIN', 'ANALISTA', 'GERENTE', 'OPERADOR'],
        },
        loadComponent: () =>
          import('./domains/resources/pages/transactions/transactions').then((m) => m.Transactions),
        title: 'Luxury - Transacciones',
      },
      {
        path: 'financial-exchange',
        data: {
          roles: ['ADMIN', 'GERENTE'],
        },
        loadComponent: () =>
          import('./domains/financial-exchange/financial-exchange/financial-exchange').then(
            (m) => m.FinancialExchange,
          ),
        title: 'Luxury - Cambio financiero',
      },
      {
        path: 'business-rules',
        data: {
          roles: ['ADMIN', 'GERENTE'],
        },
        loadComponent: () =>
          import('./domains/business-rules/business-rules/business-rules').then(
            (m) => m.BusinessRules,
          ),
        title: 'Luxury - Reglas',
      },
      {
        path: 'audit',
        data: {
          roles: ['ADMIN', 'AUDITOR'],
        },
        loadComponent: () =>
          import('./domains/audit/audit/audit').then((m) => m.Audit),
        title: 'Luxury - Auditoria',
      },
      {
        path: 'reports',
        data: {
          roles: ['ADMIN', 'GERENTE', 'AUDITOR', 'ANALISTA'],
        },
        loadComponent: () =>
          import('./domains/reports/reports/reports').then((m) => m.Reports),
        title: 'Luxury - Reportes',
      },
      {
        path: 'session-monitoring',
        data: {
          roles: ['ADMIN', 'GERENTE', 'AUDITOR', 'ANALISTA', 'OPERADOR'],
        },
        loadComponent: () =>
          import('./domains/session-monitoring/session-monitoring/session-monitoring').then(
            (m) => m.SessionMonitoring,
          ),
        title: 'Luxury - Sesiones',
      },
    ],
  },
];
