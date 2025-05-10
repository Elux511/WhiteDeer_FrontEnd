<template>
    <div class="user-view-container">
      <el-row>
        <!-- 左侧导航栏 -->
        <el-col :span="6">
          <el-menu
            :default-active="activeMenu"
            class="el-menu-vertical-demo"
            @select="handleMenuSelect"
          >
            <el-menu-item index="checkin">我的打卡</el-menu-item>
            <el-menu-item index="join-team">加入团队</el-menu-item>
            <el-menu-item index="my-team">我的团队</el-menu-item>
            <el-menu-item index="personal-info">个人信息</el-menu-item>
          </el-menu>
          <div class="server-clock-container">
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
          <el-button type="primary" @click="logout">注销账号</el-button>
        </el-col>
        <!-- 右侧内容展示区域 -->
        <el-col :span="18">
          <component :is="currentComponent"></component>
        </el-col>
      </el-row>
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
      lastSynced: null
      };
    },
    computed: {
    hours() {
      if (!this.serverTime) return '00'
      const hours = this.serverTime.getHours() % 12
      return hours === 0 ? '12' : hours.toString().padStart(2, '0')
    },
    minutes() {
      if (!this.serverTime) return '00'
      return this.serverTime.getMinutes().toString().padStart(2, '0')
    },
    seconds() {
      if (!this.serverTime) return '00'
      return this.serverTime.getSeconds().toString().padStart(2, '0')
    },
    period() {
      if (!this.serverTime) return ''
      return this.serverTime.getHours() >= 12 ? 'PM' : 'AM'
    },
    hourAngle() {
      if (!this.serverTime) return 0
      const hours = this.serverTime.getHours() % 12
      const minutes = this.serverTime.getMinutes()
      return (hours * 30) + (minutes * 0.5)
    },
    minuteAngle() {
      if (!this.serverTime) return 0
      const minutes = this.serverTime.getMinutes()
      const seconds = this.serverTime.getSeconds()
      return (minutes * 6) + (seconds * 0.1)
    },
    secondAngle() {
      if (!this.serverTime) return 0
      return this.serverTime.getSeconds() * 6
    }
  },
  mounted() {
    this.syncServerTime()
    // 每秒更新一次时间
    this.timer = setInterval(() => {
      if (this.serverTime) {
        this.serverTime = new Date(Date.now() + this.timeDiff)
        // 每秒钟切换分隔符的动画状态
        this.animateSeparator = !this.animateSeparator
      }
    }, 1000)
  },
  beforeDestroy() {
    clearInterval(this.timer)
  },
    methods: {
      async syncServerTime() {
      try {
        // 替换为您的实际服务器时间API
        const response = await axios.get('/api/time')
        
        if (!response.ok) {
          throw new Error(`服务器响应错误: ${response.status}`)
        }
        
        const serverTimeStr = await response.text()
        const serverTime = new Date(serverTimeStr).getTime()
        const clientTime = Date.now()
        
        this.timeDiff = serverTime - clientTime
        this.serverTime = new Date(serverTime)
        this.lastSynced = new Date()
        this.loading = false
        
        console.log(`服务器时间同步成功，差值: ${this.timeDiff}ms`)
      } catch (error) {
        console.error('服务器时间同步失败:', error)
        this.loading = false
        
        // 降级使用客户端时间
        this.serverTime = new Date()
        
        // 显示错误提示
        this.$message && this.$message.error('服务器时间获取失败，使用本地时间')
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
        this.$confirm('是否确定注销账号?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$message({
            type: 'success',
            message: '注销成功!'
          });
          this.$store.commit('Signout');
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消注销'
          });
        });
        
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
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
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
  </style>