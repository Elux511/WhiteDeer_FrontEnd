import Vue from 'vue'
import App from './App.vue'
import Element from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import router from './router'
import store from './store'
import BaiduMap from 'vue-baidu-map'
//import home from'./views/HomeView.vue'
//import user from'./views/UserView.vue'
Vue.config.productionTip = false
Vue.use(Element)
Vue.use(BaiduMap,{
  ak:'UFmRbqgIC6MSDdN0JDZxfEJhfiixRujC'//插眼密钥
})
new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
