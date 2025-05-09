import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    isLogin:false,
    isNotFound:false,
    id:''
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
    }
  },
  actions: {
  },
  modules: {
  }
})
