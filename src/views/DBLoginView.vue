<template>
  <div class="quick-login-container">
    <el-main>
      <div class="login-wrapper">
        <div class="login-form">
          <h3 class="center">登录账号</h3>
          <el-tabs v-model="activeTab" type="card" class="login-tabs">
            <el-tab-pane label="快捷登录" name="quick-login">
              <el-form :model="form1" @submit.native.prevent="handleSubmit1">
                <el-form-item>
                  <br><el-input v-model="form1.phoneNumber" placeholder="请输入手机号" prefix-icon="el-icon-phone-outline"></el-input>
                </el-form-item>
                  <el-form-item>
                <el-row :gutter="15">
                  <el-col :span="14">
                    <el-input v-model="form1.verificationCode" placeholder="请输入验证码" prefix-icon="el-icon-lock-outline"></el-input>
                  </el-col>
                  <el-col :span="9">
                    <el-button @click="getVerificationCode" :loading="countdown > 0">
                      {{ countdown > 0? countdown : '获取验证码' }}
                    </el-button>
                  </el-col>
                </el-row>
              </el-form-item>
                <el-form-item>
                  <br><el-button type="primary" :loading="isLoading" @click="handleSubmit1" style="width: 100px;display: flex;justify-content: center">登录</el-button>
                </el-form-item>
              </el-form>
            </el-tab-pane>
            <el-tab-pane label="密码登录" name="password-login">
              <el-form :model="form2" @submit.native.prevent="handleSubmit2">
                <el-form-item>
                  <br><el-input v-model="form2.zhanghao" placeholder="请输入8位账号" prefix-icon="el-icon-user"></el-input>
                </el-form-item>
                <el-form-item>
                  <el-input v-model="form2.code" placeholder="请输入4-12位密码" prefix-icon="el-icon-lock" show-password></el-input>
                </el-form-item>
                <el-form-item>
                  <br><el-button type="primary" :loading="isLoading" @click="handleSubmit2" style="width: 100px;display: flex;justify-content: center">登录</el-button>
                </el-form-item>
              </el-form>
            </el-tab-pane>
            <el-tab-pane label="扫码登录" name="saoma-login">
              <!-- 待完善 -->
                <img src="../../image/zw.jpg">
            </el-tab-pane>
          </el-tabs>
          <p class="register-link">没有账号? <router-link to="/register">去注册</router-link></p>
        </div>
      </div>
    </el-main>
  </div>
</template>

<script>
//import request from '@/utils/request';
export default {
  data() {
    return {
      activeTab: 'quick-login',
      form1: {
        phoneNumber: '',
        verificationCode: ''
      },
      form2:{
        zhanghao: '',
        code: ''
      },
      isLoading: false,
      countdown: 0,
      timer: null,
      phoneReg:/^1[3-9]\d{9}$/,
      vercodeReg:/^\d{6}$/,
      zhanghaoReg:/^\d{8}$/,
      codeReg:/^[a-zA-Z0-9_!?,.@#$%^&*+-=()[\]{}~:;'"`<>|/\\]{4,12}$/
    };
  },
  mounted() {
    window.addEventListener('resize', this.handleResize);
    this.handleResize();
    const jsonData1 = localStorage.getItem('loginInfoKey1');
    const jsonData2 = localStorage.getItem('loginInfoKey2');
    if (jsonData1) {
        var loginInfo = JSON.parse(jsonData1);
        this.form1.phoneNumber = loginInfo.phoneNumber;
    }
    if (jsonData2) {
        loginInfo = JSON.parse(jsonData2);
        this.form2.zhanghao = loginInfo.id;
        this.form2.code = loginInfo.code;
    }
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize);
    if (this.timer) {
      clearInterval(this.timer);
    }
  },
  methods: {
    handleSubmit1() {
      if(!this.phoneReg.test(this.form1.phoneNumber)) {
        this.$message.warning('请正确填写手机号');
        return;
      }
      if(!this.vercodeReg.test(this.form1.verificationCode)) {
        this.$message.warning('请正确填写验证码');
        return;
      }
      this.isLoading = true;
      setTimeout(() => {
        this.isLoading = false;
        this.$message.success('登录成功');
      }, 1500);
      this.$store.commit('Login')
      this.saveDataToLocalStorage('loginInfoKey1',{
        phoneNumber:this.form1.phoneNumber
      })
      /*跳转至用户试图*/
      //this.$router.push('/home/user')
    },
    handleSubmit2() {
      if (!this.zhanghaoReg.test(this.form2.zhanghao)) {
        this.$message.warning('请正确填写账号');
        return;
      }
      if (!this.codeReg.test(this.form2.code)) {
        this.$message.warning('请正确填写密码');
        return;
      }
      this.isLoading = true;
      setTimeout(() => {
        this.isLoading = false;
        this.$message.success('登录成功');
      }, 500);
      this.$store.commit('Login')
     // this.$store.commit('setid',id)
      this.saveDataToLocalStorage('loginInfoKey2',{
        id:this.form2.zhanghao,
        code:this.form2.code
      })
      /*request.post('api/login',{
        id:this.form2.zhanghao,
        code:this.form2.code
      })*/

    },
    getVerificationCode() {
      if(!this.phoneReg.test(this.form1.phoneNumber)) {
        this.$message.warning('请正确填写手机号');
        return;
      }
      this.countdown = 60;
      this.startCountdown();
      // 这里应调用后端接口发送验证码，以下为模拟
      setTimeout(() => {
        this.$message.success('验证码已发送');
      }, 1500);
    },
    startCountdown() {
      if (this.timer) {
        clearInterval(this.timer);
      }
      this.timer = setInterval(() => {
        if (this.countdown <= 0) {
          clearInterval(this.timer);
          this.timer = null;
        } else {
          this.countdown--;
        }
      }, 1000);
    },
    goToScanLogin() {
      // 这里可添加跳转逻辑，目前先提示
      this.$message.info('暂未实现，敬请期待');
    },
    handleResize() {
      const logoImg = document.getElementById('logo-img');
      if (logoImg) {
        // 由于 CSS 已经实现按比例缩放，这里可不做额外处理
        // 可根据需求添加自定义缩放逻辑
      }
    },
    saveDataToLocalStorage(key, data) {
    const jsonData = JSON.stringify(data);
    localStorage.setItem(key, jsonData);
}
  }
};
</script>

<style scoped>
.quick-login-container {
  height: 630px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 30px;
}

.login-form {
  width: 300px;
  background-color: #fff;
  padding: 20px;
  border-radius: 5px;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
}

.login-tabs {
  margin-bottom: 5px;
}

.login-tabs >>>.el-tabs__header {
  margin-bottom: 10px;
  border-bottom: 1px solid #ccc; /* 添加底部的分界线 */
}
.login-tabs >>>.el-tabs__nav {
  height: 40px; /* 减小选项卡的高度，可按需调整具体数值 */
  border: none;
}

.login-tabs >>>.el-tabs__item {
  width:100px;
  padding: auto;
  border: 1px solid #ccc;
  border-left: none;
  border-right: none;
  border-bottom: none;
  border-radius: 5px 5px 0 0;
}

.login-tabs >>>.el-tabs__active {
  background-color: #f0f9ff;
  border-color: #409eff;
  color: #409eff;
}

.el-form-item {
  margin-bottom: 15px;
}

.el-form-item__label {
  color: #333;
  font-weight: 500;
}

.el-input__inner {
  height: 40px;
  line-height: 40px;
}

.el-button {
  display: flex;
  align-items: center;
  height: 40px;
  line-height: 40px;
  margin: auto;
}

.el-button--primary {
  background-color: #409eff;
  border-color: #409eff;
}

.register-link {
  text-align: center;
  margin-top: 15px;
}

.register-link a {
  color: #663399;
  text-decoration: underline;
}
.center{
    font-size: 20px;
    display: flex;
    justify-content: center;
}

img{
  max-width: 80%;
  max-height: 20%;
}
</style>