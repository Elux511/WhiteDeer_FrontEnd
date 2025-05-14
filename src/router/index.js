import Vue from 'vue'
import VueRouter from 'vue-router'
import HomeView from '../views/HomeView.vue'
import store from '../store'
//import { component } from 'vue/types/umd'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    component: HomeView,
    name:'home',
    redirect:'login',
    /*children:[
      {
    path: 'home/login',
    component: () => import('../views/LoginView.vue')
  },
  {
    path: 'home/register',
    component: () => import('../views/RegisterView.vue')
  }
    ]*/
  },
  {
    path: '/login',
    name:'login',
    component: () => import('../views/LoginView.vue')
  },
  {
    path: '/register',
    name:'register',
    component: () => import('../views/RegisterView.vue')
  },
  {
    path:'/user',
    name:'user',
    component: () => import('../views/User/UserView.vue')
  },
  {
    path:'/404',
    name:'notfound',
    component:()=>import('../views/NotFoundView.vue')
  },
  {
    path:'*',
    name:'notfound',
    redirect:'/404'
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

router.beforeEach((to, from, next) => {
  if(to.name == 'notfound'){
    store.commit('NotFound')
  }
  if(to.name !== 'notfound' && from.name == 'notfound'){
    store.commit('found')
  }
  console.log(11111)
  console.log('isLogin:'+store.getters.getLoginState)
  console.log('isNotFound:'+store.getters.getNotFoundState)
  next();
});

export default router
