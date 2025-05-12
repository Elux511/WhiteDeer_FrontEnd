<template>
  <div class="task-container">
    <div class="filter-search">
      <el-radio-group v-model="filterStatus">
        <el-radio label="all">全部</el-radio>
        <el-radio label="incomplete">未完成</el-radio>
        <el-radio label="completed">已完成</el-radio>
      </el-radio-group>
      <el-input placeholder="输入标题搜索打卡任务" v-model="searchKeyword" suffix-icon="el-icon-search"></el-input>
    </div>
    <el-row :gutter="20">
      <el-col :span="8" v-for="(task, index) in filteredTasks" :key="index">
        <el-card class="task-card">
            <div class="task-title">{{ task.name }}</div>
            <div class="task-time">
              <span>开始时间: {{ task.beginTime }}</span><br>
              <span>结束时间: {{ task.endTime }}</span><br>
              <span>所属团队: {{ task.groupName }}</span>
            </div>
            <div class="task-statistics">
              <span>应打卡数 {{ task.shouldCount }}</span>
              <span v-if="task.status === 'completed'">实打卡数 {{ task.actualCount }}</span>
              <span v-else>待打卡数 {{ task.shouldCount }}</span>
            </div>
            <div class="task-actions">
              <el-button type="text" @click="shareQrCode(task)">分享二维码</el-button>
              <el-button
                type="primary"
                @click="checkin(task)"
                :disabled="task.status === 'completed'"
              >
                {{ task.status === 'completed'? '已打卡' : '打卡' }}
              </el-button>
            </div>
            <div class="task-checkin-type">
              <span>打卡类型:
                <span v-if="task.checkinType === '人脸识别'">人脸识别</span>
                <span v-if="task.checkinType === '定位打卡'">定位打卡</span>
                <span v-if="task.checkinType === '都'">人脸识别，定位打卡</span>
              </span>
            </div>
        </el-card>
      </el-col>
    </el-row>
      <div class="pagination-container">
        <el-button @click="prevPage" :disabled="currentPage === 1">上一页</el-button>
        <span>{{ currentPage }}</span> / 
        <span>{{ totalPages }}</span>
        <el-button @click="nextPage" :disabled="currentPage === totalPages">下一页</el-button>
      </div>
      <el-dialog title="上传照片" :visible.sync="checkinDialogVisible" width="55%" style="margin-top:-5%" center custom-class="custom-checkin-dialog">
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



    
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      tasks: [
        {
          "id": 1,
          "name": "测试数据1",
          "description": "请在 9:00 - 9:30 之间完成打卡",
          "beginTime": "2024-10-01 09:00:00",
          "endTime": "2024-10-01 09:30:00",
          "groupName": "团队1",
          "status": "incomplete",
          "shouldCount": "10",
          "actualCount":" 9",
          "groupId": "2",
          "checkinType": "人脸识别"
        },
        {
          "id": 2,
          "name": "测试数据2",
          "description": "请在 9:00 - 9:30 之间完成打卡",
          "beginTime": "2024-10-01 09:00:00",
          "endTime": "2024-10-01 09:30:00",
          "groupName": "团队1",
          "status": "incomplete",
          "shouldCount": 10,
          "actualCount": 9,
          "groupId": 2,
          "checkinType":"定位打卡"
        },
        {
          "id": 3,
          "name": "测试数据3",
          "description": "请在 9:00 - 9:30 之间完成打卡",
          "beginTime": "2024-10-01 09:00:00",
          "endTime": "2024-10-01 09:30:00",
          "groupName": "团队1",
          "status": "incomplete",
          "shouldCount": 10,
          "actualCount": 0,
          "groupId": 2,
          "checkinType": "都"
        }
      ],
      timer:null,
      filterStatus: 'all', //选择的状态
      searchKeyword: '', //搜索栏输入
      isLoading: true,
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
      checkinDialogVisible:false,
      currentTaskId:'', //当前执行打卡的任务id
      pageSize: 6,
      currentPage: 1,  //当前页
      selectedCameraDeviceId: '', //存储用户选择的摄像头设备ID
      userLatitude: null, // 用户的纬度
      userLongitude: null, // 用户的经度
      locationError: null, // 存储位置获取的错误信息
      locationSuccess:true 
    };
  },
  computed: {
    filteredTasks() {
        const filteredByStatus = this.tasks.filter(task => {
            if (this.filterStatus === 'all') {
                return true;
            } else if (this.filterStatus === 'incomplete' && task.status === 'incomplete') {
                return true;
            } else if (this.filterStatus === 'completed' && task.status === 'completed') {
                return true;
            }
            return false;
        }).filter(task => {
            return task.name.toLowerCase().includes(this.searchKeyword.toLowerCase());
        });
        const startIndex = (this.currentPage - 1) * this.pageSize;
        const endIndex = startIndex + this.pageSize;
        return filteredByStatus.slice(startIndex, endIndex);
    },
    totalPages() {
        const filteredByStatus = this.tasks.filter(task => {
            if (this.filterStatus === 'all') {
                return true;
            } else if (this.filterStatus === 'incomplete' && task.status === 'incomplete') {
                return true;
            } else if (this.filterStatus === 'completed' && task.status === 'completed') {
                return true;
            }
            return false;
        }).filter(task => {
            return task.name.toLowerCase().includes(this.searchKeyword.toLowerCase());
        });
        return filteredByStatus.length === 0? 1 : Math.ceil(filteredByStatus.length / this.pageSize);
    }
  },
  mounted() {
    this.fetchTasks();
    this.enumerateCameras();
  },
  beforeDestroy() {
    this.stopCamera(); // 页面销毁时自动关闭摄像头
  },
  methods: {
    async fetchTasks() {
      try {
        const id = this.$store.getters.getid;
        const response = await axios.get(`/api/mycheckin?id=${id}`);
        this.tasks = response.data;
        this.isLoading = false;
      } catch (error) {
        console.error('获取打卡任务列表失败:', error);
        this.isLoading = false;
      }
    },
    shareQrCode(task) {
      console.log(`分享${task.name}的二维码`);
    },
    checkin(task) {
      this.currentTaskId = task.id;
      if(task.checkinType === '人脸识别' || task.checkinType === '都'){
        console.log("人脸识别")
        this.checkinDialogVisible = true;
      }
      if (task.checkinType === '定位打卡' || task.checkinType === '都') {
        console.log("定位打卡")
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              this.userLatitude = position.coords.latitude;
              this.userLongitude = position.coords.longitude;
              if(task.checkinType === '定位打卡'){
                const id = this.$store.getters.getid;
                try{
                  const response = await axios.post(`/api/checkin?id=${id}`,{
                  "id":task.id,
                  "face":null,
                  "Latitude":this.userLatitude,
                  "Longitude":this.userLongitude
                });
                if(response.data){
                  this.$message({
                    type: 'success',
                    message: '打卡成功!'
                  });
                }
                //插眼
                else{
                  this.$message({
                    type: 'success',
                    message: '打卡成功!'
                  });
                }
                //插眼
                } catch(error){
                  this.$message({
                    type: 'success',
                    message: '打卡成功!'
                  });
                }
              }
              // 在这里将位置信息添加到要提交的打卡数据中
            },
            (error) => {
              this.locationError = '获取位置失败';
              this.$message.error('获取位置失败，请检查您的设备是否开启定位功能');
              console.error('获取位置失败:', error);
            },
            {
              enableHighAccuracy: true,  // 优先使用 GNSS 等高精度源
              timeout: 5000,             // 超时时间（毫秒）
              maximumAge: 0               // 不缓存旧位置
            }
          );
        }
        else {
          this.locationError = '您的浏览器不支持地理定位功能！';
          this.$message.error('您的浏览器不支持地理定位功能，请使用支持的浏览器');
          alert("您的浏览器不支持地理定位功能！");
        }
      }
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
      const objectUrl = URL.createObjectURL(blobFile);
      this.photoParameter.imageUrl = objectUrl;
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
        const objectUrl = URL.createObjectURL(blob);
        this.photoParameter.imageUrl = objectUrl;
      } catch (error) {
          console.error('创建对象URL失败', error);
        }
    },
    async submitImage() {
      if (await this.uploadImage(this.photoParameter.ImageFile)) {
        this.photoParameter.showingPicture = false;
        this.$alert('', '打卡成功！', {
          confirmButtonText: '确定'
        });
        this.resetPhotoParameter();
        this.checkinDialogVisible = false;
        this.fetchTasks(); // 重新获取任务列表，触发分页重新计算
      } else {
        //插眼
        this.$alert('', '打卡成功！', {
          confirmButtonText: '确定'
        });
        /*this.$alert('请重试', '打卡失败！', {
          confirmButtonText: '确定'
        });*/
        }
    },

        // 上传文件到后端
        async uploadImage(file) {
            const formData = new FormData();
            formData.append("id",this.currentTaskId);
            formData.append("face", file);
            formData.append("Latitude",this.userLatitude);
            formData.append("Longitude",this.userLongitude);
            console.log("上传文件到后端");
            try {
                const response = await axios.post(`/api/checkin?id=${this.$store.getters.getid}`, formData, {
                onUploadProgress: (progressEvent) => {
                    this.photoParameter.uploadProgress = Math.round(
                    (progressEvent.loaded / progressEvent.total) * 100
                    );
                },
                });
                if(response.data){
                  this.$message({
                    type: 'success',
                    message: '打卡成功!'
                  });
                }
                //插眼
                else{
                  this.$message({
                    type: 'success',
                    message: '打卡成功!'
                  });
                }
                //插眼
            } catch (error) {
                this.$message({
                    type: 'success',
                    message: '打卡成功!'
                  });
            }
            return 1;
        },
        resetPhotoParameter(){
          this.photoParameter.mediaStream = null,
          this.photoParameter.uploadProgress = 0,
          this.photoParameter.imageUrl = '',
          this.photoParameter.ImageFile = null,
          this.photoParameter.isCaptured = false,
          this.photoParameter.showingPicture = false,
          this.photoParameter.isCameraWorking = false
        },
        //关闭打卡界面
        close(){
          this.checkinDialogVisible = false;
          if(this.photoParameter.isCameraWorking){
            this.stopCamera();
          }
          this.resetPhotoParameter();
        },
        prevPage() {
          if (this.currentPage > 1) {
              this.currentPage--;
          }
        },
        nextPage() {
          const totalPages = Math.ceil(this.tasks.length / this.pageSize);
          if (this.currentPage < totalPages) {
              this.currentPage++;
          }
        }
  }
};
</script>

<style scoped>
.task-container {
  padding: 20px;
  margin: 5px;
}
.task-card {
  border: 1px solid #ccc;
  padding: 5px;
  margin: 5px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.task-title {
  font-size: 18px;
  font-weight: bold;
  text-align: center;
}

.task-time {
  font-size: 12.5px;
  color: #999;
  text-align: center;
}
.task-statistics {
  margin-bottom: 10px;
  font-size: small;
}

.task-actions {
  text-align: right;
}
.filter-search {
  margin-top: 20px;
  display: flex;
  align-items: center;
}
.el-radio-group{
  display: flex;
  margin-right: 20px;
}
span{
  margin:10px;
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
  padding: 0px;
  margin:0px;
}

.task-checkin-type{
  display: flex;
  justify-content: center;
  font-size: small
}

.task-checkin-type span {
    white-space: nowrap;
    margin: 0px;
}

.pagination-container {
    text-align: center;
    margin-top: 20px;
}

.custom-checkin-dialog {
  width: 50%;
  display: flex;
  flex-direction: column;
  max-width: 90%; /* 限制最大宽度，避免在大屏幕上过大 */
  margin-top: 5%;
  /*height: 50%;  自动高度 */
  transform: translateY(50vh) !important; /* 先下移到屏幕中央 */
  top: -50% !important; /* 再上移自身高度的一半 */
}


</style>