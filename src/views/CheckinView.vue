<template>
    <el-container class="userview">
            <el-main><!-- 摄像头实时画面 -->
                <div class="video-container">
                    <video ref="video" autoplay playsinline></video>
                    <img  v-if="showingPicture" :src="imageUrl" alt="Displayed Image" />
                </div>
            </el-main>
            <el-footer class="button-container">
                    <button @click="startCamera">启动摄像头</button>
                    <button @click="stopCamera">关闭摄像头</button>
                    <button v-if="!showingPicture" @click="captureImage">拍照</button>
                    <button v-if="isCaptured" @click="submitImage">提交</button>
                    <button v-if="showingPicture" @click="startAgain">重拍</button>
                    <!-- 上传进度 -->
                    <progress :value="uploadProgress" max="100" v-if="uploadProgress > 0"></progress>
                
            </el-footer>
        
    </el-container>
</template>



<script>
import axios from 'axios'
export default {
    data() {
        return {
        videoStream: null,
        uploadProgress: 0,
        imageUrl:'',
        ImageFile:null,
        isCaptured:false,
        showingPicture:false,
        isCameraWorking:false
        };
    },
    methods: {
        async startCamera() {
            try {
                this.mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
                this.$refs.video.srcObject = this.mediaStream;
                this.$refs.video.play();
                this.isCameraWorking = true;
            } catch (error) {
                console.error('摄像头调用失败:', error);
            }
            },
        stopCamera() {
            if (this.mediaStream) {
                const tracks = this.mediaStream.getTracks();
                tracks.forEach(track => track.stop()); // 关闭所有媒体流跟踪
                this.mediaStream = null;
                this.$refs.video.srcObject = null; // 重置video元素
                this.isCameraWorking = false;
            }
        },
        startAgain(){
            this.ImageFile = null;
            this.isCaptured = false;
            this.showingPicture = false;
            this.startCamera();
        },
        beforeDestroy() {
            this.stopCamera(); // 页面销毁时自动关闭摄像头
        },
        showBlobImage(blobFile) {
            const objectUrl = URL.createObjectURL(blobFile);
            this.imageUrl = objectUrl;
        },
        // 拍照并转为文件
        async captureImage() {
            if(!this.isCameraWorking) {
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
            this.ImageFile = file;
            this.isCaptured = true;
            this.showingPicture = true;
            this.stopCamera();
            
            // 回显照片到页面上
            try {
                const objectUrl = URL.createObjectURL(blob);
                this.imageUrl = objectUrl;
            } catch (error) {
                console.error('创建对象URL失败', error);
            }
        },
        async submitImage(){
            await this.uploadImage(this.ImageFile);
            this.showingPicture = false;
        },

        // 上传文件到后端
        async uploadImage(file) {
            const formData = new FormData();
            formData.append("image", file);
            console.log("上传文件到后端");
            try {
                const response = await axios.post("/api/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" },
                onUploadProgress: (progressEvent) => {
                    this.uploadProgress = Math.round(
                    (progressEvent.loaded / progressEvent.total) * 100 
                    );
                },
                });
                console.log("上传成功", response.data);
            } catch (error) {
                console.error("上传失败", error);
            }
        },
    },
    };
    </script>


<style scoped>
.button-container {
    display: flex;
    flex-direction:row;
    justify-content: center;
    background-color: lightgreen;
    margin-left:10px;
    margin-right:0;
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
    display: flex;
    justify-content: center;
    width: 70vh; /* 假设视频容器占父元素宽度的50% */
    height: 20vh;
    padding-bottom: 39.375%; /*根据16:9宽高比计算，50% * 9 / 16 ，保持视频比例 */
    position: relative;
    /*background-color: red;*/
    
}
.video-container video {
    width: 65vh;
    object-fit: cover; /* 视频按比例缩放并裁剪以填满容器 */
    position: absolute;
    top: 0;
    left: 0;
}
.video-container img {
    width: 65vh;
    object-fit: cover; /* 照片按比例缩放并裁剪以填满容器 */
    position: absolute;
    top: 0;
    left: 0;
}
.userview{
    /*display:flex;
    flex-direction:column;
    justify-content: center;*/
    height:65vh;
    margin-left:80px;
    margin-right:80px;
    margin-top:20px;
}
.a{
    background-color: black;
}

</style>