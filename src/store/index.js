import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from 'vuex-persistedstate';
Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    isLogin:false,
    isNotFound:false,
    id:'',
    haveface:false
  },
  getters: {
    getLoginState(state){
      return state.isLogin;
    },
    getNotFoundState(state){
      return state.isNotFound;
    },
    getid(state){
      return state.id;
    },
    getFaceStatus(state){
      return state.haveface;
    }
  },
  mutations: {
    Login(state){
      state.isLogin = true;
    },
    Signout(state){
      state.isLogin = false;
      state.id = '';
    },
    NotFound(state){
      state.isNotFound = true;
    },
    Found(state){
      state.isNotFound = false;
    },
    setid(state,id){
      state.id = id;
    },
    setFaceStatus(state,status){
      state.haveface = status;
    }
  },
  actions: {
  },
  modules: {
  },
  plugins: [createPersistedState({
    storage: window.sessionStorage
  })]
})
