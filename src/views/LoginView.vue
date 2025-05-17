<template>
  <div class="quick-login-container">
      <div class="login-wrapper">
        <div class="login-form">
          <h3 class="center">登录账号</h3>
          <el-tabs v-model="activeTab" type="card" class="login-tabs">
            <el-tab-pane label="快捷登录" name="quick-login">
              <el-form :model="form1" @submit.native.prevent="handleSubmit1">
                <el-form-item>
                  <br v-if="!isMobile">
                  <el-input v-model="form1.phoneNumber" placeholder="请输入手机号" prefix-icon="el-icon-phone-outline"></el-input>
                </el-form-item>
                  <el-form-item>
                <el-row :gutter="15">
                  <el-col :span="13">
                    <el-input v-model="form1.verificationCode" placeholder="请输入验证码" prefix-icon="el-icon-lock"></el-input>
                  </el-col>
                  <el-col :span="10" style="display: flex;">
                    <el-button @click="getVerificationCode" :loading="countdown > 0">
                      {{ countdown > 0? countdown : '获取验证码' }}
                    </el-button>
                    <div class="tooltip">
                      <span style="margin-left: 10px;" @mouseenter="showTooltip = true" @mouseleave="showTooltip = false">?</span>
                      <span v-if="showTooltip" class="tooltiptext">次数限制：每小时5次，每天10次</span>
                    </div>
                  </el-col>
                </el-row>
              </el-form-item>
                <el-form-item>
                  <br v-if="!isMobile"><el-button type="primary" :loading="isLoading" @click="handleSubmit1" style="width: 100px;display: flex;justify-content: center">登录</el-button>
                </el-form-item>
              </el-form>
            </el-tab-pane>
            <el-tab-pane label="密码登录" name="password-login">
              <el-form :model="form2" @submit.native.prevent="handleSubmit2">
                <el-form-item>
                  <br v-if="!isMobile">
                  <el-input v-model="form2.zhanghao" placeholder="请输入8位账号" prefix-icon="el-icon-user"></el-input>
                </el-form-item>
                <el-form-item>
                  <el-input v-model="form2.code" placeholder="请输入4-12位密码" prefix-icon="el-icon-lock" show-password></el-input>
                </el-form-item>
                <el-form-item>
                  <br v-if="!isMobile">
                  <el-button type="primary" :loading="isLoading" @click="handleSubmit2" style="width: 100px;display: flex;justify-content: center">登录</el-button>
                </el-form-item>
              </el-form>
            </el-tab-pane>
            <el-tab-pane label="扫码登录" name="saoma-login">
              <!-- 待完善 -->
                <img src="../../image/QRcode.png" style="left:30px;top:10px;">
            </el-tab-pane>
          </el-tabs>
          <p class="register-link">没有账号? <router-link to="/register">去注册</router-link></p>
        </div>
      </div>
  </div>
</template>

<script>
import axios from 'axios';
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
      codeReg:/^[a-zA-Z0-9_!?,.@#$%^&*+-=()[\]{}~:;'"`<>|/\\]{4,12}$/,
      showTooltip:false,
      isMobile:false
    };
  },
  mounted() {
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    this.isMobile = mediaQuery.matches;
    mediaQuery.addEventListener('change', (e) => {
      this.isMobile = e.matches;
    });

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
    async handleSubmit1() {
      if(!this.phoneReg.test(this.form1.phoneNumber)) {
        this.$message.warning('请正确填写手机号');
        return;
      }
      if(!this.vercodeReg.test(this.form1.verificationCode)) {
        this.$message.warning('请正确填写验证码');
        return;
      }
      this.isLoading = true;
      try{
        const res = await axios.post('/api/checkvericode',{
          "phoneNumber":this.form1.phoneNumber,
          "vericode":this.form1.verificationCode
        });
        if(res.data.state == 1){
          this.$message.success('已发送验证码，请注意查收');
          try{
            const response = await axios.post('/api/login1',{
              "phoneNumber":this.form1.phoneNumber
            });
            if(response.data.state == 1){
              this.$message.success('登录成功!');
              //Storage.setItem("isLogin",JSON.stringify(true));
              this.$store.commit('Login');
              this.$router.push('/user');
              this.$store.commit('setid',response.data.data.id);
              this.$store.commit('setFaceStatus',response.data.data.haveface);
              this.saveDataToLocalStorage('loginInfoKey1',{
                phoneNumber:this.form1.phoneNumber
              })
            }
            else if(response.data.status == 2){
              this.$message.error('手机号未注册!');
            }
          } catch{
            this.$message.error('请求发送失败，请检查网络或联系管理员');
          }
        }
        else if(res.data.state == 2){
          this.$message.warning('验证码错误！');
        }
        else if(res.data.state == 3){
          this.$message.warning('手机号不存在或验证码已过期！');
        }
      } catch{
        this.$message.error('请求发送失败，请检查网络或联系管理员');
      } finally{
        this.isLoading = false;
      }
    },
    async handleSubmit2() {
      if (!this.zhanghaoReg.test(this.form2.zhanghao)) {
        this.$message.warning('请正确填写账号');
        return;
      }
      if (!this.codeReg.test(this.form2.code)) {
        this.$message.warning('请正确填写密码');
        return;
      }
      this.isLoading = true;
      try{
        const response = await axios.post('/api/login2',{
          "id":this.form2.zhanghao,
          "password":this.form2.code
        });
        if(response.data.state == 1){
          this.$message.success('登录成功!');
          //sessionStorage.setItem("isLogin",JSON.stringify(true));
          this.$store.commit('Login');
          this.$router.push('/user');
          this.$store.commit('setid',this.form2.zhanghao);
          this.$store.commit('setFaceStatus',response.data.data.haveface);
          this.saveDataToLocalStorage('loginInfoKey2',{
            id:this.form2.zhanghao,
            code:this.form2.code
          })
        }
        if(response.data.state == 2){
          this.$message.error('该账号未注册!');
          return;
        }
        if(response.data.state == 3){
          this.$message.error('密码错误!');
          return;
        }
      } catch{
        this.$message.error('请求发送失败，请检查网络或联系管理员');
      } finally{
        this.isLoading = false;
      }
    },
    async getVerificationCode() {
      if(!this.phoneReg.test(this.form1.phoneNumber)) {
        this.$message.warning('请正确填写手机号');
        return;
      }
      this.countdown = 60;
      this.startCountdown();
      try{
        const response = await axios.post(`/api/vericode?phoneNumber=${this.form1.phoneNumber}`);
        if(response.data.state == 1){
          this.$message.success('已发送验证码，请注意查收');
        }
        else if(response.data.state == 2){
          this.$message.error('验证码发送失败，请稍后重试');
        }
      }catch{
        this.$message.error('请求发送失败，请检查网络或联系管理员');
      }
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
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
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




.tooltip {
  position: relative;
  display: inline-block;
}

.tooltiptext {
  width: 120px;
  background-color: black;
  color: white;
  text-align: center;
  border-radius: 6px;
  padding: 5px;
  position: absolute;
  z-index: 100;
  bottom: 100%;
  left: -350%;
  margin-left: -60px;
  opacity: .7;
  transition: opacity 0.3s;
}

.tooltiptext::after {
  content: "";
  position: absolute;
  top: 100%;
  left: 50%;
  margin-left: -5px;
  border-width: 5px;
  border-style: solid;
  border-color: #555 transparent transparent transparent;
}

.tooltip:hover.tooltiptext {
  visibility: visible;
  opacity: 1;
}


/*手机端CSS*/


@media (max-width: 768px) {
  .quick-login-container{
    background-color: rgb(194, 238, 252);
    width: 100%;
    height: auto;
    justify-content: center;
    align-items: center;
    padding: 0;
  }

  .login-form {
    background-color: rgb(194, 238, 252);
    width: 300px;
    padding: 20px;
    border-radius: 5px;
    box-shadow: 0 0 10px white;
  }

  .tooltiptext {
    font-size: 8px;
    width: 120px;
    height: 35px;
    background-color: black;
    color: white;
    text-align: left;
    border-radius: 6px;
    position: absolute;
    z-index: 100;
    padding: 5px;
    margin-right: 10px;
    opacity: .7;
    transition: opacity 0.3s;
  }


  .MobileButton {
  display: flex;
  align-items: center;
  height: 40px;
  line-height: 40px;
  margin-top: 30px ;
}

}




</style>