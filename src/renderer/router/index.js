import { createRouter, createWebHashHistory } from 'vue-router';
import Home from '../views/Home.vue';
import Login from '../views/Login.vue';

const routes = [
  {
    path: '/',
    name: 'LoginPage',
    component: Login, // Login sahifasini asosiy yo‘lga bog‘lash
  },
  {
    path: '/home',
    name: 'Home',
    component: Home,
  },
];

const router = createRouter({
  history: createWebHashHistory(), // `hash` tarixini ishlatish
  routes,
});

export default router;
