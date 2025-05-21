<template>
  <div>
    <div class="loading-overlay" v-if="isLoading">
      <div class="loading-spinner"></div>
    </div>
    <div class="user-info-container">
      <div class="user-info-item">
        <span class="label" v-if="!isMobile" style="width:85px">账号:</span>
        <span class="label" v-if="isMobile" style="width:50px">账号:</span>
        <span class="value">{{ userInfo.id }}</span>
        <el-button type="text" @click="changePasswordDialogVisible = true" class="button-margin">修改密码</el-button>
        <el-dialog title="修改密码" :visible.sync="changePasswordDialogVisible" width="30%" center>
          <el-form>
            <el-form-item label="请输入原密码:">
              <el-input v-model="originPassword" prefix-icon="el-icon-lock" show-password></el-input>
            </el-form-item>
            <el-form-item label="请输入4-12位新密码:">
              <el-input v-model="updatePassword" prefix-icon="el-icon-lock" show-password></el-input>
            </el-form-item>
            <el-form-item label="请再次输入新密码:">
              <el-input v-model="updatePasswordAgain" prefix-icon="el-icon-lock" show-password></el-input>
            </el-form-item>
          </el-form>
          <span slot="footer" class="dialog-footer">
            <el-button type="primary" @click="handleChangePassword">确 定</el-button>
            <el-button @click="cancleChangePassword">取 消</el-button>
          </span>
        </el-dialog>
      </div>
      <hr class="divider" />
      <div class="user-info-item">
        <span class="label">用户名:</span>
        <span class="value">{{ userInfo.name }}</span>
        <el-button type="text" @click="changeNameDialogVisible = true" class="button-margin">更换用户名</el-button>
        <el-dialog title="修改用户名" :visible.sync="changeNameDialogVisible" width="30%" center>
          <el-form>
            <el-form-item label="请输入新用户名：">
              <el-input v-model="updateName"></el-input>
            </el-form-item>
          </el-form>
          <span slot="footer" class="dialog-footer">
            <el-button type="primary" @click="handleChangeName">确 定</el-button>
            <el-button @click="cancleChangeName">取 消</el-button>
          </span>
        </el-dialog>
      </div>
      <hr class="divider" />
      <div class="user-info-item">
        <span class="label">手机号:</span>
        <span class="value">{{ userInfo.phoneNumber }}</span>
        <el-button type="text" @click="changePhoneDialogVisible = true" class="button-margin">更换手机号</el-button>
        <el-dialog title="修改手机号" :visible.sync="changePhoneDialogVisible" width="30%" center>
          <el-input placeholder="请输入新手机号" v-model="updatePhone"></el-input>
          <div class="verification">
            <el-input placeholder="请输入验证码" v-model="verificationCode"></el-input>
            <el-button @click="getVerificationCode" :loading="countdown > 0">
              {{ countdown > 0? countdown : '获取验证码' }}
            </el-button>
            <div class="tooltip">
              <span style="display: inline-flex; align-items: center; vertical-align: middle; margin-left: 10px;" @mouseenter="showTooltip = true" @mouseleave="showTooltip = false">?</span>
              <span v-if="showTooltip" class="tooltiptext">次数限制：每小时5次，每天10次</span>
            </div>
          </div>
          <span slot="footer" class="dialog-footer">
            <el-button class="Dialog-button" type="primary" @click="handleChangePhone">确 定</el-button>
            <el-button class="Dialog-button" @click="cancleChangePhone">取 消</el-button>
          </span>
        </el-dialog>
      </div>
      <hr class="divider" />
      <div class="user-info-item">
        <span class="label">照片</span>
        <span class="value">&nbsp;</span>
        <el-button type="text" @click="changePhotoDialogVisible = true" class="button-margin">
          <span v-if="this.$store.getters.getFaceStatus">更换照片</span>
          <span v-else>上传照片</span>
        </el-button>
        <el-dialog title="修改照片" :visible.sync="changePhotoDialogVisible" width="55%" style="margin-top:-5%" center>
          <div style="display: flex;">
            <div v-if="photoParameter.cameraDevices.length > 1">
              选择调用的摄像头设备：<el-select v-model="selectedCameraDeviceId" placeholder="选择摄像头">
                <el-option
                  v-for="device in photoParameter.cameraDevices"
                  :key="device.deviceId"
                  :label="device.label"
                  :value="device.deviceId"
                ></el-option>
              </el-select>
            </div>
            <div>
              <h3>注意：当照片出现多张人脸时只识别最大的人脸</h3>
            </div>
          </div>
            <div class="video-container">
              <video ref="video" autoplay playsinline></video>
              <img  v-if="photoParameter.showingPicture" :src="photoParameter.imageUrl" alt="Displayed Image" />
            </div>
            <div class="button-container">
              <button @click="debounceStartCamera">启动摄像头</button>
              <button @click="stopCamera">关闭摄像头</button>
              <button v-if="!photoParameter.showingPicture" @click="captureImage">拍照</button>
              <button v-if="photoParameter.isCaptured" @click="submitImage">提交</button>
              <button v-if="photoParameter.showingPicture" @click="startAgain">重拍</button>
              <progress :value="photoParameter.uploadProgress" max="100" v-if="photoParameter.uploadProgress > 0"></progress>
            </div>
          <span slot="footer" class="dialog-footer">
            <el-button type="primary" @click="closeChangePhotoDialog">关 闭</el-button>
          </span>
        </el-dialog>
      </div>
      <div class="photo-container">
        <div class="photo-display">
          <img :src="userInfo.face" alt="用户照片" v-if="userInfo.face" style="width: 100%; height: 100%;"/>
          <div class="placeholder" v-else>照片显示</div>
        </div>
      </div>
      <div class="center">
        <el-button type="primary" @click="deleteUser">删除账号</el-button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      userInfo: {
        id:'',
        name:'',
        phoneNumber:'',
        face:null
      },
      changePasswordDialogVisible:false,
      changeNameDialogVisible:false,
      changePhoneDialogVisible:false,
      changePhotoDialogVisible:false,
      photoParameter:{
        mediaStream: null,
        uploadProgress: 0,
        imageUrl:'',
        ImageFile:null,
        isCaptured:false,
        showingPicture:false,
        isCameraWorking:false,
        cameraDevices: []
      },
      originPassword:'',
      updatePassword:'',
      updatePasswordAgain:'',
      updateName:'',
      updatePhone:'',
      verificationCode:'',
      phoneReg:/^1[3-9]\d{9}$/,
      vercodeReg:/^\d{6}$/,
      nameReg:/^([\u4e00-\u9fa5]|\w){2,8}$/,
      codeReg:/^[a-zA-Z0-9_!?,.@#$%^&*+-=()[\]{}~:;'"`<>|/\\]{4,12}$/,
      countdown: 0,
      timer:null,
      selectedCameraDeviceId: '', //存储用户选择的摄像头设备ID
      showTooltip:false,
      isLoading:true,
      isMobile:false,
      cameraDebounceTimer: null  //防抖
    };
  },
  mounted() {
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    this.isMobile = mediaQuery.matches;
    mediaQuery.addEventListener('change', (e) => {
      this.isMobile = e.matches;
    });
    this.fetchUserInfo();
    this.enumerateCameras();
  },
  methods: {
    async fetchUserInfo() {
      this.isLoading = true;
      try {
        this.userInfo.id = this.$store.getters.getid;
        const response = await axios.get(`/api/myinfo?id=${this.userInfo.id}`);
        if(response.data.state == 1){
          this.userInfo = response.data.data;
        }
        else if(response.data.state == 2){
          this.$message.error('获取用户信息失败,请稍后重试');
        }
      } catch {
        this.$message.error('请求发送失败，请检查网络或联系管理员');
      } finally{
        this.isLoading = false;
      }
    },
    async getVerificationCode() {
        if (!this.phoneReg.test(this.updatePhone)) {
            this.$message.warning('请正确填写手机号');
            return;
        }
        this.countdown = 60;
        this.startCountdown();
        await axios.post(`/api/vericode?phoneNumber=${this.updatePhone}`)
        .then(response => {
          if(response.data.state == 1){
            this.$message.success('验证码已发送，请注意查收');
          }
          if(response.data.state == 2){
            this.$message.error('验证码发送失败，请稍后重试');
          }
        }).catch(() => {
          this.$message.error('请求发送失败，请检查网络或联系管理员');
        })
    },
    async handleChangePassword(){
      if(!this.codeReg.test(this.originPassword)){
        this.$message.warning('请正确输入原密码！');
        return;
      }
      if(!this.codeReg.test(this.updatePassword)){
        this.$message.warning('请正确输入新密码！');
        return;
      }
      if(this.updatePassword !== this.updatePasswordAgain){
        this.$message.warning('两次输入密码不一致！');
        return;
      }
      if(this.originPassword === this.updatePassword){
        this.$message.warning('请勿修改为同一个密码！');
        return;
      }
      try{
        const res = await axios.post('/api/login2',{
          "id":this.userInfo.id,
          "password":this.originPassword
        });
        if(res.data.state == 1){
          try{
            const response = await axios.patch('/api/changepassword',{
              "id":this.userInfo.id,
              "password":this.updatePassword
            });
            if(response.data.state == 1){
              this.$message.success('修改成功！');
              this.cancleChangePassword();
              await this.fetchUserInfo();
            }
            else if(response.data.state == 2){
              this.$message.error('修改密码失败，请稍后重试');
            }
          } catch{
            this.$message.error('请求发送失败，请检查网络或联系管理员');
          }
        }
        if(res.data.state == 3){
          this.$message.error('原密码错误!');
        }
      } catch{
        this.$message.error('请求发送失败，请检查网络或联系管理员');
      }
    },
    async handleChangeName(){
      if(!this.nameReg.test(this.updateName)){
        this.$message.warning('请正确输入用户名！');
        return;
      }
      if(this.updateName === this.userInfo.name){
        this.$message.warning('请勿修改重复名字！');
        return;
      }
      const id = this.$store.getters.getid;
      await axios.patch('/api/changename',{
        "id":id,
        "name":this.updateName
      }).then(response => {
        if(response.data.state == 1){
          this.$message.success('修改成功！');
          this.cancleChangeName();
          this.fetchUserInfo();
        }
        else if(response.data.state ==2){
          this.$message.error('修改失败,请稍后重试');
        }
      }).catch(() => {
        this.$message.error('修改失败，请稍后重试');
      });
    },
    async handleChangePhone() {
      if (!this.phoneReg.test(this.updatePhone)) {
        this.$message.warning('请正确填写手机号');
        return;
      }
      if(this.updatePhone === this.userInfo.phoneNumber){
        this.$message.warning('请勿修改重复手机号！');
        return;
      }
      if(!this.vercodeReg.test(this.verificationCode)) {
        this.$message.warning('请正确填写验证码');
        return;
      }
      try{
        const res = await axios.post('/api/checkvericode',{
          "phoneNumber":this.updatePhone,
          "vericode":this.verificationCode
        });
        if(res.data.state == 1){
          try{
            const response = await axios.patch('/api/changephone',{
            "id":this.userInfo.id,
            "phoneNumber":this.updatePhone
          });
          if(response.data.state == 1){
            this.$message.success('修改成功！');
            this.cancleChangePhone();
            await this.fetchUserInfo();
          }
          else if(response.data.state == 2){
            this.$message.error('该手机号已绑定其他账号！');
          }
          }catch{
            this.$message.error('请求发送失败，请检查网络或联系管理员');
          }
        }
        else if(res.data.state == 2){
          this.$message.error('验证码错误！');
        }
        else if(res.data.state == 3){
          this.$message.error('手机号不存在或验证码已过期！');
        }
      } catch{
        this.$message.error('请求发送失败，请检查网络或联系管理员');
      } 
    },
    cancleChangePassword(){
      this.originPassword = '';
      this.updatePassword = '';
      this.updatePasswordAgain = '';
      this.changePasswordDialogVisible = false;
    },
    cancleChangeName(){
      this.updateName = '';
      this.changeNameDialogVisible = false;
    },
    cancleChangePhone(){
      this.updatePhone = '';
      this.verificationCode = '';
      this.changePhoneDialogVisible = false;
    },
    closeChangePhotoDialog(){
      if(this.photoParameter.isCameraWorking){
        this.stopCamera();
      }
      this.resetPhotoParameter();
      this.changePhotoDialogVisible = false;
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
    async enumerateCameras() {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        this.photoParameter.cameraDevices = videoDevices;
        if (videoDevices.length > 0) {
          this.selectedCameraDeviceId = videoDevices[0].deviceId; // 默认选择第一个摄像头
        }
        console.log('摄像头设备:', videoDevices);
      } catch (error) {
        console.error('枚举摄像头失败:', error);
      }
    },
    debounceStartCamera() {
      if (this.cameraDebounceTimer) {
        clearTimeout(this.cameraDebounceTimer);
      }
      
      this.cameraDebounceTimer = setTimeout(async () => {
        await this.startCamera();
        this.cameraDebounceTimer = null;
      }, 300); // 300ms防抖延迟
    },
    async startCamera() {
      this.stopCamera();
      try {
        const constraints = {
          video: { deviceId: { exact: this.selectedCameraDeviceId } }
        };
        this.photoParameter.mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        this.$refs.video.srcObject = this.photoParameter.mediaStream;
        this.$refs.video.play();
        this.photoParameter.isCameraWorking = true;
      } catch (error) {
          console.error('摄像头调用失败:', error);
        }
    },
        stopCamera() {
            if (this.photoParameter.mediaStream) {
                const tracks = this.photoParameter.mediaStream.getTracks();
                tracks.forEach(track => track.stop()); // 关闭所有媒体流跟踪
                this.photoParameter.mediaStream = null;
                this.$refs.video.srcObject = null; // 重置video元素
                this.photoParameter.isCameraWorking = false;
            }
        },
        startAgain(){
            this.photoParameter.ImageFile = null;
            this.photoParameter.isCaptured = false;
            this.photoParameter.showingPicture = false;
            this.startCamera();
        },
        beforeDestroy() {
            this.stopCamera(); // 页面销毁时自动关闭摄像头
        },
        showBlobImage(blobFile) {
            this.photoParameter.imageUrl = URL.createObjectURL(blobFile);
        },
        // 拍照并转为文件
        async captureImage() {
            if(!this.photoParameter.isCameraWorking) {
                return;
            }
            const canvas = document.createElement("canvas");
            const video = this.$refs.video;// 等待视频元数据加载
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            
            //转换为blob
            const blob = await new Promise((resolve) => {
                canvas.toBlob(resolve, "image/jpeg", 0.8); // 质量压缩至80%
            });
            const file = new File([blob], "capture.jpeg", { type: "image/jpeg" });
            this.photoParameter.ImageFile = file;
            this.photoParameter.isCaptured = true;
            this.photoParameter.showingPicture = true;
            this.stopCamera();
            
            // 回显照片到页面上
            try {
                this.photoParameter.imageUrl = URL.createObjectURL(blob);
            } catch (error) {
                console.error('创建对象URL失败', error);
            }
        },
        async submitImage(){
          const formData = new FormData();
          formData.append("id",this.$store.getters.getid);
          formData.append("face", this.photoParameter.ImageFile);
          try {
            const response = await axios.patch("/api/setface", formData, {
              onUploadProgress: (progressEvent) => {
                this.photoParameter.uploadProgress = Math.round(
                (progressEvent.loaded / progressEvent.total) * 100
                );
              },
            });
            if(response.data.state == 1){
              this.$message.success('上传成功！');
              await this.fetchUserInfo();
              this.closeChangePhotoDialog();
            }
            else if(response.data.state == 2){
              this.$message.error('照片保存失败！');
            }
            else if(response.data.state == 4){
              this.$message.error('未识别到人脸，请重试');
            }
          } catch {
            this.$message.error('请求发送失败，请检查网络或联系管理员');
            //插眼
          } 
        },

        resetPhotoParameter(){
          this.photoParameter.mediaStream = null;
          this.photoParameter.uploadProgress = 0;
          this.photoParameter.imageUrl = '';
          this.photoParameter.ImageFile = null;
          this.photoParameter.isCaptured = false;
          this.photoParameter.showingPicture = false;
          this.photoParameter.isCameraWorking = false;
        },
        deleteUser(){
          this.$confirm('此操作将删除此账号所有信息，是否继续?', '⚠警告！', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(async () => {
            try {
              const response = await axios.delete(`/api/deleteuser?id=${this.userInfo.id}`);
              if(response.data.state == 1){
                this.$message.success('删除账号成功，自动返回首页');
                //sessionStorage.setItem("isLogin",JSON.stringify(false));
                this.$store.commit('Signout');
                await this.$router.push('/login');
                //插眼
                //sessionStorage.setItem("isLogin",false);
              }
              else if(response.data.state == 2){
                this.$message.info('删除账号失败,请稍后重试');
              }
            } catch (error) {
              this.$message.error('请求发送失败，请检查网络或联系管理员');
            }
          }).catch(() => {
            this.$message('已取消操作');
          });
        }
  }
};
</script>

<style scoped>

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}
.loading-spinner {
  width: 50px;
  height: 50px;
  border: 3px solid rgba(52, 152, 219, 0.3);
  border-radius: 50%;
  border-top-color: #3498db;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
.user-info-container {
  padding: 20px;
  width: 600px;
  margin: 0 auto;
}

.user-info-item {
  margin-bottom: 15px;
  display: flex;
  align-items: center;
}

.label {
  width: 100px;
  margin-right: 10px;
}

.value {
  flex: 1;
  text-align: center;
}


.button-margin {
  margin-left: 10px;
}

.photo-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.photo-display {
  width: 360px;
  height: 270px;
  background-color: #eee;
  display: flex;
  justify-content: center;
  align-items: center;
}

.placeholder {
  color: #999;
}

.divider {
  border: none;
  border-top: 1px solid #ccc;
  margin: 10px 0;
}

.verification{
  display: flex;
  margin: 10px 0;
}


.button-container {
    display: flex;
    flex-direction:row;
    justify-content: center;
    background-color: rgb(210, 228, 235);
    margin-left:40px;
    margin-right:40px;
}
.button-container button {
    width:auto;
    height:30px;
    margin-right: 3vh;
}
.el-container{
    display: flex;
}
.el-main{
    /*flex-grow: 1;*/
    width:80vh;
}
.video-container {
  width: 100%;
  max-width: 800px;
  height: 0;
  padding-bottom: 56.25%; /* 16:9 宽高比 */
  position: relative; /* 关键：设置为相对定位 */
  margin-bottom: 20px;
}
.video-container video {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block; /* 确保视频在显示时占满空间 */
}
.video-container img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block; /* 确保图片在显示时占满空间 */
}

.el-dialog__footer {
  padding: 0;
  margin:0;
}


.center{
  padding-top: 50px;
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




@media (max-width: 768px){
  .user-info-container {
    padding: 0;
    padding-top: 20px;
    width: 100%;
    min-height: 600px;
    margin: 0 auto;
  }


  .label {
    width: auto;
    margin-right: 0;
  }
  .value {
    padding-left: 0;
  }

  .photo-container {
    display: flex;
    justify-content: center;
    margin-top: 40px;
  }

  .photo-display {
    width: 100%;
    height: auto;
    background-color: #eee;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}
</style>    