<template>
    <el-container style="height: 500px;">
        <el-container>
            <el-header class="big-middle-container">白鹿打卡</el-header>
            <el-container>
                <el-main>
                    <div class="logo">
                        <img id="logo-img" src="../../image/bailuLOGO(45).png" alt="白鹿打卡">
                    </div>
                </el-main>
            </el-container>
        </el-container>
        <el-aside style="width: 430px; height:700px; background-color: lightblue;">
            <router-view></router-view>
        </el-aside>
    </el-container>
</template>

<script>
export default{
    data(){
        return {
            isMobile:false,
        };
    },
    methods:{
    }
}
</script>
<style scoped>
.big-middle-container {
    display: flex;
    justify-content: center;
    height: 100vh;
    font-size: 60px;
    font-weight: bold;
    font-family:serif;
}
/*.middle{
    display: flex;
    flex-direction:column;
    justify-content: center;
}
.center-container{
    display: flex;
    align-items: center;
    
}*/



.logo {
  text-align: center;
  margin-top: 3%;
}

.logo img {
  max-width: 500px;
  max-height: 550px;
  height: auto;
  width: auto;
}
</style>