// App.vue
<template>
  <div id="app">
    <HomeView v-if="showHomeView"></HomeView>
    <UserView v-if="showUserView"></UserView>
    <NotFoundView  v-if="showNotFoundView"></NotFoundView>
  </div>
</template>

<script>
import HomeView from './views/HomeView.vue';
import UserView from './views/User/UserView.vue';
import NotFoundView from './views/NotFoundView.vue';
import { mapState } from 'vuex';

export default {
  components: {
    HomeView,
    UserView,
    NotFoundView
  },
  computed: {
    ...mapState(['isLogin','isNotFound'])
  },
  data() {
    return {
      showHomeView: true,
      showUserView: false,
      showNotFoundView:false
    };
  },
  watch: {
    isLogin(newValue) {
      if (newValue) {
        this.showHomeView = false;
        this.showUserView = true;
      } else {
        this.showHomeView = true;
        this.showUserView = false;
      }
    }/*,
    isNotFound(newValue) {
      if (newValue) {
        this.showHomeView = false;
        this.showNotFoundView = true;
        this.showUserView = false;
      } else if(this.isLogin){
        this.showHomeView = false;
        this.showNotFoundView = false;
        this.showUserView = true;
      }
      else{
        this.showHomeView = true;
        this.showNotFoundView = false;
        this.showUserView = false;
      }
      console.log(this.showHomeView+
        this.showNotFoundView+
        this.showUserView)
    }*/
  }
};
</script>