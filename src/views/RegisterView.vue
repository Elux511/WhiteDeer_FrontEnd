<template>
    <div class="quick-login-container">
        <div class="login-wrapper">
            <div class="login-form">
                <h3 class="center">注册账号</h3>
                <el-tabs v-model="activeTab" type="card" class="login-tabs">
                    
                    <el-form :model="form" @submit.native.prevent="handleSubmit">
                        <el-form-item>
                            <el-input v-model="form.username" placeholder="请输入2-8位用户名" prefix-icon="el-icon-user"></el-input>
                        </el-form-item>
                        <el-form-item>
                            <el-input v-model="form.usercode" placeholder="请输入4-12位密码" prefix-icon="el-icon-lock" show-password></el-input>
                        </el-form-item>
                        <el-form-item>
                            <el-input v-model="form.checkcode" placeholder="请再次输入密码" prefix-icon="el-icon-lock" show-password></el-input>
                        </el-form-item>
                        <el-form-item>
                            <el-input v-model="form.phoneNumber" placeholder="请输入手机号" prefix-icon="el-icon-phone-outline"></el-input>
                        </el-form-item>
                        <el-form-item class="mobileVercode">
                            <el-row :gutter="15">
                                <el-col :span="isMobile?14:13">
                                    <el-input v-model="form.verificationCode" placeholder="请输入验证码" prefix-icon="el-icon-lock"></el-input>
                                </el-col>
                                <el-col :span="isMobile?10:9" style="display: flex;">
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
                        <el-button type="primary" :loading="isLoading" @click="handleSubmit">立即注册</el-button>
                    </el-form-item>
                    </el-form>
                </el-tabs>
                <p class="register-link">已有账号？ <router-link to="/login">去登陆</router-link></p>
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
        form: {
            phoneNumber: '',
            username: '',
            usercode: '',
            checkcode: '',
            verificationCode: ''
        },
        isLoading: false,
        countdown: 0,
        timer: null,
        codeReg:/^[a-zA-Z0-9_!?,.@#$%^&*+-=()[\]{}~:;'"`<>|/\\]{4,12}$/,
        phoneReg:/^1[3-9]\d{9}$/,
        vercodeReg:/^\d{6}$/,
        nameReg:/^([\u4e00-\u9fa5]|\w){2,8}$/,
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
    },
    beforeDestroy() {
        window.removeEventListener('resize', this.handleResize);
        if (this.timer) {
        clearInterval(this.timer);
        }
    },
    methods: {
        async handleSubmit() {
            if (!this.nameReg.test(this.form.username)) {
                this.$message.warning('请正确输入用户名！');
                return;
            }
            if (!this.codeReg.test(this.form.usercode)) {
                this.$message.warning('请正确输入密码！');
                return;
            }
            if(this.form.usercode !== this.form.checkcode){
                this.$message.warning('两次输入密码不一致！');
                return;
            }
            if (!this.phoneReg.test(this.form.phoneNumber)) {
                this.$message.warning('请正确填写手机号');
                return;
            }
            if(!this.vercodeReg.test(this.form.verificationCode)) {
                this.$message.warning('请正确填写验证码');
                return;
            }

            this.isLoading = true;
            try{
                const res = await axios.post('/api/checkvericode',{
                    "phoneNumber":this.form.phoneNumber,
                    "vericode":this.form.verificationCode
                });
                if(res.data.state == 1){
                    try{
                        const response = await axios.post('/api/register',{
                            "name":this.form.username,
                            "password":this.form.usercode,
                            "phoneNumber":this.form.phoneNumber
                        });
                        if(response.data.state == 1){
                            this.$confirm(`您的账号是：${response.data.data.id}`,'注册成功！',{
                                confirmButtonText: '确定',
                                cancelButtonText: '取消',
                                type: 'success'
                            }).then(() => {
                                this.saveDataToLocalStorage('loginInfoKey2',{
                                    id:response.data.data.id
                                })
                                this.$router.push('/login');
                            }).catch(() => {
                                this.saveDataToLocalStorage('loginInfoKey2',{
                                    id:response.data.data.id
                                })
                                this.$router.push('/login');
                            })
                        }
                        else if(response.data.state == 2){
                            this.$message.error('手机号已被注册！');
                            return;
                        }
                        else if(response.data.state == 3){
                            this.$message.error('手注册失败，请稍后重试');
                            return;
                        }
                    }catch{
                        this.$message.error('请求发送失败，请检查网络或联系管理员');
                    }
                }
                else if(res.data.state == 2){
                    this.$message.error('验证码错误！');
                    return;
                }
                else if(res.data.state == 3){
                    this.$message.error('手机号不存在或验证码已过期！');
                    return;
                }
            } catch{
                this.$message.error('请求发送失败，请检查网络或联系管理员');
            } finally{
                this.isLoading = false;
            }
        },
        async getVerificationCode() {
            if (!this.phoneReg.test(this.form.phoneNumber)) {
                this.$message.warning('请正确填写手机号');
                return;
            }
            this.countdown = 60;
            this.startCountdown();
            try{
                const response = await axios.post(`/api/vericode?phoneNumber=${this.form.phoneNumber}`);
                if(response.data.state == 1){
                    this.$message.success('已发送验证码，请注意查收');
                }
                else if(response.data.state == 2){
                    this.$message.error('验证码发送失败，请稍后重试');
                }
            } catch{
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
    height:630px;
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

.login-tabs >>>.el-tabs__header >>>.el-tab-pane {
  text-align: center; /* 使内部文本水平居中 */
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
  margin: 0;
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







@media (max-width: 768px) {
    .center{
    font-size: 20px;
    display: flex;
    justify-content: center;
    margin:10px
}
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
    padding: 10px 20px 10px 20px;
    border-radius: 5px;
    box-shadow: 0 0 10px white;
  }

    .el-form-item {
        margin-bottom: 8px;
        margin-left: 11px;
        margin-right: 11px;
    }
    .el-button{
        height: 38px;
        padding: 15px;
    }

   .mobileVercode{
    margin-left: 12px;
    margin-right: 25px;
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


}
</style>