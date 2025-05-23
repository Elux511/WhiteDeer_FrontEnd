<template>
  <div>
    <div class="user-view-container">
      <el-row :span="1">
        <div style="display: flex;" v-if="isMobile">
          <el-button
              @click="toggleCollapse"
              :icon="isCollapsed? 'el-icon-arrow-right' : 'el-icon-arrow-left'"
              circle
              size="small">
              {{ isCollapsed? '展开菜单' : '收起菜单' }}
          </el-button>
          <div class="logo-container">
            <h2 style="margin-top: 0;">白鹿打卡</h2>
            <img src="../../../image/bailuLOGO1.png" alt="标志图" class="logo-image" :style="logoStyle">
          </div>
        </div>
      </el-row>
      <el-row>
        <!-- 左侧导航栏 -->
        <el-col :span="isCollapsed?0:6">
          <div class="user-view-sider" :class="{ 'collapsed': isCollapsed }">
            <el-menu
              :default-active="activeMenu"
              :collapse="isMobile?isCollapsed:false"
              class="el-menu-vertical-demo"
              @select="handleMenuSelect"
            >
              <el-menu-item index="checkin">
                <i v-if="!isCollapsed" class="el-icon-s-claim"></i>
                <span slot="title">我的打卡</span>
              </el-menu-item>
              <el-menu-item index="join-team">
                <i v-if="!isCollapsed" class="el-icon-s-opportunity"></i>
                <span slot="title">加入团队</span>
              </el-menu-item>
              <el-menu-item index="my-team">
                <i v-if="!isCollapsed" class="el-icon-s-cooperation"></i>
                <span slot="title">我的团队</span>
              </el-menu-item>
              <el-menu-item index="personal-info">
                <i v-if="!isCollapsed" class="el-icon-user"></i>
                <span slot="title">个人信息</span>
              </el-menu-item>
            </el-menu>
            <div v-if="!isMobile" class="server-clock-container">
              <div v-if="loading" class="loading-indicator">
                <div class="spinner"></div>
                <p>正在同步服务器时间...</p>
              </div>
              <div v-else class="clock-wrapper">
                <!-- 数字时钟 -->
                <div class="digital-clock">
                  <span class="time-unit" :class="{ 'pulse': animateSeparator }">{{ hours }}</span>
                  <span class="separator">{{ separator }}</span>
                  <span class="time-unit">{{ minutes }}</span>
                  <span class="separator">{{ separator }}</span>
                  <span class="time-unit">{{ seconds }}</span>
                  <span class="period">{{ period }}</span>
                </div>
                
                <!-- 模拟时钟 -->
                <div class="analog-clock" v-if="serverTime">
                  <div class="clock-face">
                    <!-- 时钟刻度 -->
                    <div v-for="i in 60" :key="i" 
                        class="clock-mark"
                        :class="{ 'hour-mark': i % 5 === 0 }"
                        :style="{ transform: `rotate(${i * 6}deg)` }"></div>
                    
                    <!-- 指针 -->
                    <div class="hand hour-hand" 
                        :style="{ transform: `rotate(${hourAngle}deg)` }"></div>
                    <div class="hand minute-hand" 
                        :style="{ transform: `rotate(${minuteAngle}deg)` }"></div>
                    <div class="hand second-hand" 
                        :style="{ transform: `rotate(${secondAngle}deg)` }"></div>
                    
                    <!-- 中心点 -->
                    <div class="center-point"></div>
                  </div>
                </div>
              </div>
            </div>
            <el-button 
              type="primary" 
              v-if="!isCollapsed"
              @click="logout"  
              :class="{ 'button-normal':!isMobile, 'button-collapsed': isMobile }"
              >注销账号
            </el-button>
          </div>
        </el-col>
        <!-- 右侧内容展示区域 -->
        <el-col :span="isMobile?24:18">
          <component :is="currentComponent"></component>
        </el-col>
      </el-row>
      </div>
      <div class="center">
        <el-dialog title="上传照片" :visible.sync="faceDialogVisible" width="55%" style="margin-top:-5%" center custom-class="custom-checkin-dialog">
          <div v-if="photoParameter.cameraDevices.length > 1">
          选择调用的摄像头设备：
          <el-select v-model="selectedCameraDeviceId" placeholder="选择摄像头">
            <el-option
              v-for="device in photoParameter.cameraDevices"
              :key="device.deviceId"
              :label="device.label"
              :value="device.deviceId"
            ></el-option>
          </el-select>
        </div>
        <div class="video-container">
          <video ref="video" autoplay playsinline></video>
          <img  v-if="photoParameter.showingPicture" :src="photoParameter.imageUrl" alt="Displayed Image" />
        </div>
        <div class="button-container">
          <button @click="startCamera">启动摄像头</button>
          <button @click="stopCamera">关闭摄像头</button>
          <button v-if="!photoParameter.showingPicture" @click="captureImage">拍照</button>
          <button v-if="photoParameter.isCaptured" @click="submitImage">提交</button>
          <button v-if="photoParameter.showingPicture" @click="startAgain">重拍</button>
          <progress :value="photoParameter.uploadProgress" max="100" v-if="photoParameter.uploadProgress > 0"></progress>
        </div>
        <span slot="footer" class="dialog-footer">
          <el-button type="primary" @click="close">关 闭</el-button>
        </span>
        </el-dialog>
      </div>
    </div>
  </template>
  
  <script>
  import MyCheckin from './MyCheckinView.vue';
  import JoinTeam from './JoinTeamView.vue';
  import MyTeam from './MyTeamView.vue';
  import PersonalInfo from './MyInfoView.vue';
  import axios from 'axios';
  export default {
    name: 'UserView',
    data() {
      return {
        activeMenu: 'checkin',
        currentComponent: MyCheckin,
        serverTime: null,
        timeDiff: 0,
        loading: true,
        timer: null,
        animateSeparator: false,
        separator: ':',
        lastSynced: null,
        faceDialogVisible: false,
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
        isMobile:false,
        isCollapsed:false, 
        selectedCameraDeviceId: '', //存储用户选择的摄像头设备ID
      };
    },
    computed: {
      hours() {
        if (!this.serverTime) {
          const localTime = new Date();
          const hours = localTime.getHours() % 12;
          return hours === 0? '12' : hours.toString().padStart(2, '0');
        }
        const hours = this.serverTime.getHours() % 12;
        return hours === 0? '12' : hours.toString().padStart(2, '0');
      },
      minutes() {
        if (!this.serverTime) {
          const localTime = new Date();
          return localTime.getMinutes().toString().padStart(2, '0');
        }
        return this.serverTime.getMinutes().toString().padStart(2, '0');
      },
      seconds() {
        if (!this.serverTime) {
          const localTime = new Date();
          return localTime.getSeconds().toString().padStart(2, '0');
        }
        return this.serverTime.getSeconds().toString().padStart(2, '0');
      },
      period() {
        if (!this.serverTime) {
          const localTime = new Date();
          return localTime.getHours() >= 12? 'PM' : 'AM';
        }
        return this.serverTime.getHours() >= 12? 'PM' : 'AM';
      },
      hourAngle() {
        if (!this.serverTime) {
          const localTime = new Date();
          const hours = localTime.getHours() % 12;
          const minutes = localTime.getMinutes();
          return (hours * 30) + (minutes * 0.5);
        }
        const hours = this.serverTime.getHours() % 12;
        const minutes = this.serverTime.getMinutes();
        return (hours * 30) + (minutes * 0.5);
      },
      minuteAngle() {
        if (!this.serverTime) {
          const localTime = new Date();
          const minutes = localTime.getMinutes();
          const seconds = localTime.getSeconds();
          return (minutes * 6) + (seconds * 0.1);
        }
        const minutes = this.serverTime.getMinutes();
        const seconds = this.serverTime.getSeconds();
        return (minutes * 6) + (seconds * 0.1);
      },
      secondAngle() {
        if (!this.serverTime) {
          const localTime = new Date();
          return localTime.getSeconds() * 6;
        }
        return this.serverTime.getSeconds() * 6;
      },
      buttonStyle() {
        if (this.isMobile) {
          return {
            marginLeft: '16%'
          };
        } else {
          return {
            marginLeft: '30%'
          };
        }
      }
    },
    mounted() {
      const mediaQuery = window.matchMedia('(max-width: 768px)');
      this.isMobile = mediaQuery.matches;
      mediaQuery.addEventListener('change', (e) => {
        this.isMobile = e.matches;
      });
      this.checkFace();
      if(!this.isMobile){
        this.syncServerTime();
        // 每秒更新一次时间
        this.timer = setInterval(() => {
          if (this.serverTime) {
            this.serverTime = new Date(Date.now() + this.timeDiff);
            // 每秒钟切换分隔符的动画状态
            this.animateSeparator = !this.animateSeparator;
          } else {
            // 如果serverTime为空（请求失败使用本地时间），也更新时间显示
            const localTime = new Date();
            this.serverTime = localTime;
            this.animateSeparator =!this.animateSeparator;
          }
        }, 1000);
      }
      this.enumerateCameras();
    },
    beforeDestroy() {
      clearInterval(this.timer);
    },
    methods: {
      checkFace(){
        if(!this.$store.getters.getFaceStatus && this.$store.getters.getLoginState){
          this.$confirm("检测到您还未上传人脸照片，是否立即前往上传？", '提示', {
            confirmButtonText: '立即上传',
            cancelButtonText: '稍后上传',
            type: 'warning'
          }).then(() => {this.faceDialogVisible = true}).catch(() => {});
        }
      },
      async syncServerTime() {
        try {
          // 替换为您的实际服务器时间API
          const response = await axios.get('/api/time');
          if (response.status === 200) {
            if (response.data.state == 1) {
              const serverTimeStr = response.data.data.time;
              const serverTime = new Date(serverTimeStr).getTime();
              const clientTime = Date.now();
              this.timeDiff = serverTime - clientTime;
              this.serverTime = new Date(serverTime);
              this.lastSynced = new Date();
              console.log(`服务器时间同步成功，差值: ${this.timeDiff}ms`);
            } else if (response.data.state == 2) {
              this.serverTime = new Date();
              this.$message && this.$message.error('服务器时间获取失败，使用本地时间');
            }
          } else {
            this.serverTime = new Date();
            this.$message && this.$message.error('服务器时间获取失败，使用本地时间');
          }
        } catch (error) {
          this.serverTime = new Date();
          this.$message && this.$message.error('请求发送失败，请检查网络或联系管理员');
        } finally{
          this.loading = false;
        }
      },
      handleMenuSelect(key) {
        switch (key) {
          case 'checkin':
            this.currentComponent = MyCheckin;
            break;
          case 'join-team':
            this.currentComponent = JoinTeam;
            break;
          case 'my-team':
            this.currentComponent = MyTeam;
            break;
          case 'personal-info':
            this.currentComponent = PersonalInfo;
            break;
          default:
            this.currentComponent = MyCheckin;
        }
        this.activeMenu = key;
      },
      logout(){
        this.$confirm('是否确定退出登录?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$message.success('注销成功!');
          //Storage.setItem("isLogin",JSON.stringify(false));
          this.$store.commit('Signout');
          this.$router.push('/login');
        }).catch(() => {
          this.$message.info('已取消注销');
        });
        
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
      async startCamera() {
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
      async submitImage() {
            const formData = new FormData();
            formData.append("id",this.$store.getters.getid);
            formData.append("face", this.photoParameter.ImageFile);
            try {
                const response = await axios.patch('/api/setface', formData, {
                  onUploadProgress: (progressEvent) => {
                    this.photoParameter.uploadProgress = Math.round(
                    (progressEvent.loaded / progressEvent.total) * 100
                    );
                  }
                });
                if(response.data.status == 1) {
                  this.$message.success('人脸照片上传成功！');
                  this.$store.commit('setFaceStatus',true);
                  this.faceDialogVisible = false;
                  this.close();
                }
                else if(response.data.state == 2){
                  this.$message.error('人脸照片上传失败，请稍后重试');
                }
            } catch {
              this.$message.error('请求发送失败，请检查网络或联系管理员');
            }
    },

        // 上传文件到后端
        resetPhotoParameter(){
          this.photoParameter.mediaStream = null;
          this.photoParameter.uploadProgress = 0;
          this.photoParameter.imageUrl = '';
          this.photoParameter.ImageFile = null;
          this.photoParameter.isCaptured = false;
          this.photoParameter.showingPicture = false;
          this.photoParameter.isCameraWorking = false;
        },
        //关闭打卡界面
        close(){
          this.faceDialogVisible = false;
          if(this.photoParameter.isCameraWorking){
            this.stopCamera();
          }
          this.resetPhotoParameter();
        },
        toggleCollapse(){
          this.isCollapsed = !this.isCollapsed;
        }
    }
  };
  </script>
  
  <style scoped>
  .user-view-container {
    padding: 20px;
  }

  button{
    margin: 10px 90px;
  }


  .server-clock-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  font-family: 'Inter', system-ui, sans-serif;
}

.loading-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #64748b;
}

.spinner {
  width: 2rem;
  height: 2rem;
  border: 3px solid #e2e8f0;
  border-radius: 50%;
  border-top-color: #3b82f6;
  animation: spin 1s linear infinite;
  margin-bottom: 0.75rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.clock-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  width: 100%;
  max-width: 300px;
}

.digital-clock {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: #ffffff;
  padding: 1rem 1rem;
  border-radius: 0.75rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  width: 100%;
}

.time-unit {
  font-size: 2.5rem;
  font-weight: 500;
  color: #1e293b;
  min-width: 2.75rem;
  text-align: center;
}

.separator {
  font-size: 2.5rem;
  font-weight: 300;
  color: #64748b;
  animation: blink 1s infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

.period {
  font-size: 1.25rem;
  font-weight: 400;
  color: #64748b;
  margin-left: 0.5rem;
}

.analog-clock {
  position: relative;
  width: 170px;
  height: 170px;
  border-radius: 50%;
  background: #ffffff;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.5);
  padding: 1rem;
}

.clock-face {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 50%;
}

.clock-mark {
  position: absolute;
  width: 2px;
  height: 100%;
  left: 50%;
  margin-left: -1px;
  background-color: #f1f5f9;
  transform-origin: center;
}

.hour-mark {
  width: 3px;
  background-color: #cbd5e1;
}

.hand {
  position: absolute;
  bottom: 50%;
  left: 50%;
  transform-origin: 50% 100%;
  border-radius: 999px;
  background-color: #334155;
}

.hour-hand {
  width: 6px;
  height: 30%;
  margin-left: -3px;
}

.minute-hand {
  width: 4px;
  height: 40%;
  margin-left: -2px;
}

.second-hand {
  width: 2px;
  height: 45%;
  margin-left: -1px;
  background-color: #ef4444;
  transition-timing-function: cubic-bezier(0.1, 2.7, 0.58, 1);
}

.center-point {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 12px;
  height: 12px;
  margin-top: -6px;
  margin-left: -6px;
  border-radius: 50%;
  background-color: #1e293b;
  z-index: 10;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.2);
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

button{
  margin:0;
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

.button-normal {
  margin-left: 30%;
}
.button-collapsed {
  margin: 11%;
}



@media (max-width: 768px){
  .user-view-sider{
    padding-top: 0;
    position:absolute;
    z-index: 100;
    background-color: #fff;
    box-shadow: 2px 0 6px rgba(0, 21, 41, 0.15);
    transition: width 0.3s ease, background-color 0.3s ease;
  }
  .user-view-sider.collapsed{
    max-width: 10px;
  }


  .logo-image {
    margin-left: 20%;
    width: 40px;        /* 设置固定宽度 */
    height: 50px;       /* 设置固定高度 */
    object-fit: cover;  /* 控制图片如何适应容器 */
  }

  .logo-container{
    width:70%;
    display: flex;
    position: absolute;
    margin-left: 37%;
    padding: 0;
  }
}


  </style>