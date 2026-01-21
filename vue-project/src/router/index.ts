import { createRouter, createWebHashHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      meta: { guest: true }
    },
    {
      path: '/',
      component: () => import('../views/MainLayoutWrapper.vue'),
      children: [
        {
          path: '',
          name: 'home',
          component: () => import('../views/HomeView.vue')
        },
        {
          path: 'device/:id',
          name: 'device-detail',
          component: () => import('../views/DeviceDetailView.vue')
        },
        {
          path: 'monitor',
          name: 'monitor',
          component: () => import('../views/MonitorView.vue')
        },
        {
          path: 'alarms',
          name: 'alarms',
          component: () => import('../views/AlarmsView.vue')
        },
        {
          path: 'sync',
          name: 'sync',
          component: () => import('../views/SyncView.vue')
        },
        {
          path: 'profile',
          name: 'profile',
          component: () => import('../views/ProfileView.vue')
        }
      ],
      meta: { requiresAuth: true }
    }
  ]
})

router.beforeEach((to, from, next) => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    next('/login')
  } else if (to.meta.guest && auth.isAuthenticated) {
    next('/')
  } else {
    next()
  }
})

export default router
