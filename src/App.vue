<template>
  <div class="app">
    <HomeView v-if="showHomeView"></HomeView>
    <MobileHomeView v-if="showMobileHomeView"></MobileHomeView>
    <UserView v-if="showUserView"></UserView>
    <NotFoundView  v-if="showNotFoundView"></NotFoundView>
  </div>
</template>

<script>
import HomeView from './views/HomeView.vue';
import MobileHomeView from './views/MobileHomeView.vue';
import UserView from './views/User/UserView.vue';
import NotFoundView from './views/NotFoundView.vue';
import { mapState } from 'vuex';

export default {
  components: {
    HomeView,
    MobileHomeView,
    UserView,
    NotFoundView
  },
    mounted(){
      const mediaQuery = window.matchMedia('(max-width: 768px)');
      this.isMobile = mediaQuery.matches;
      mediaQuery.addEventListener('change', (e) => {
        this.isMobile = e.matches;
      });
      if(this.$store.getters.getLoginState){
        this.showHomeView = false;
        this.showMobileHomeView = false;
        this.showUserView = true;
      }
      else if(!this.isMobile){
        this.showHomeView = true;
        this.showMobileHomeView = false;
        this.showUserView = false;
      }
      else{
        this.showHomeView = false;
        this.showMobileHomeView = true;
        this.showUserView = false;
      }
    },
    
    methods:{
    },
  computed: {
    ...mapState(['isLogin','isNotFound'])
  },
  data() {
    return {
      showHomeView: true,
      showUserView: false,
      showNotFoundView:false,
      showMobileHomeView:false
    };
  },
  watch: {
    isLogin(newValue) {
      if (newValue && !this.isMobile) {
        this.showHomeView = false;
        this.showMobileHomeView = false;
        this.showUserView = true;
      }
      else if(newValue && this.isMobile){
        this.showHomeView = false;
        this.showMobileHomeView = false;
        this.showUserView = true;
      }
      else if(this.isMobile){
        this.showHomeView = false;
        this.showMobileHomeView = true;
        this.showUserView = false;
      }
      else{
        this.showHomeView = true;
        this.showMobileHomeView = false;
        this.showUserView = false;
      }
    }
  }
};
</script>

<style>
@media (max-width: 768px) {
  .app{
    background-color: rgb(194, 238, 252);
  }
}


</style>