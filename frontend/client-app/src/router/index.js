import { createRouter, createWebHistory } from 'vue-router';
import { authGuard } from '../utils/authGuard';

const routes = [
    // Public Routes
    {
      path: '/',
      name: 'HomePage',
      component: () => import('../pages/home/HomePage.vue')
    },
    // Authentication Routes
    {
      path: '/login',
      name: 'Login',
      component: () => import('../pages/Login.vue'),
      meta: { requiresGuest: true }
    },
    {
      path: '/register',
      name: 'Register',
      component: () => import('../pages/Register.vue'),
      meta: { requiresGuest: true }
    },
    // Property Routes
    {
      path: '/property',
      children: [
        {
          path: '',
          name: 'PropertyList',
          component: () => import('../pages/property/PropertyList.vue')
        },
        {
          path: 'add',
          name: 'AddProperty',
          component: () => import('../pages/property/AddProperty.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: 'success/:id',
          name: 'PropertySuccess',
          component: () => import('../pages/property/PropertySuccess.vue'),
          props: true
        },
        {
          path: ':id',
          name: 'PropertyDetail',
          component: () => import('../pages/property/PropertyDetail.vue'),
          props: true
        }
      ]
    },
    {
      path: '/search',
      name: 'Search',
      component: () => import('../pages/property/PropertyList.vue')
    },
    // User Routes
    {
      path: '/user',
      children: [
        {
          path: 'profile',
          name: 'UserProfile',
          component: () => import('../pages/user/Profile.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: 'profile/edit',
          name: 'EditProfile',
          component: () => import('../pages/user/EditProfile.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: 'my-listings',
          name: 'MyListings',
          component: () => import('../pages/user/MyListings.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: 'favorites',
          name: 'UserFavorites',
          component: () => import('../pages/user/Favorites.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: 'chat',
          name: 'UserChat',
          component: () => import('../pages/user/Chat.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: 'notifications',
          name: 'UserNotifications',
          component: () => import('../pages/user/Notifications.vue'),
          meta: { requiresAuth: true }
        }
      ]
    },
    {
        path: '/my-favorites',
        redirect: '/user/favorites'
    },
    {
        path: '/chat',
        redirect: '/user/chat'
    },
    {
        path: '/notifications',
        redirect: '/user/notifications'
    },
    // Category Routes
    {
      path: '/buy',
      name: 'BuyPage',
      component: () => import('../pages/buy/BuyPage.vue')
    },
    {
      path: '/rent',
      name: 'RentPage',
      component: () => import('../pages/rent/RentPage.vue')
    },
    {
      path: '/sell',
      name: 'SellPage',
      component: () => import('../pages/property/AddProperty.vue'),
      meta: { requiresAuth: true }
    },
    // Keep existing routes for now (until pages are created)
    {
      path: '/contact',
      name: 'Contact',
      component: () => import('../pages/Contact.vue')
    },
    // 404 Route
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('../pages/NotFound.vue')
    }
  ]
;

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Apply auth guard globally
router.beforeEach((to, from, next) => {
  authGuard(to, from, next);
});

export default router;
