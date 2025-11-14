import { authGuard } from '../utils/authGuard';

const router = {
  routes: [
    {
      path: '/auth',
      name: 'PhoneAuth',
      component: () => import('../pages/PhoneAuth.vue'),
      meta: {
        requiresAuth: false,
        title: 'Login / Sign Up'
      }
    },
    {
      path: '/login',
      redirect: '/auth'
    },
    {
      path: '/signup',
      redirect: '/auth'
    },
    // Add your other existing routes here
    // Protected routes example:
    // {
    //   path: '/dashboard',
    //   name: 'Dashboard',
    //   component: () => import('../pages/Dashboard.vue'),
    //   meta: {
    //     requiresAuth: true,
    //     title: 'Dashboard'
    //   }
    // },
  ],
  
  // Apply auth guard globally
  beforeEach: (to, from, next) => {
    authGuard(to, from, next);
  }
};

export default router;
