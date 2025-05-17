<template>
    <div class="mobile-container">
        <div class="mobile-header">白鹿打卡</div>
        <div class="mobile-logo">
            <img id="logo-img" src="../../image/bailuLOGO.png" alt="白鹿打卡">
            
        </div>
        <div class="mobile-login">
            <router-view></router-view>
        </div>
    </div>
</template>

<script>
export default {
  data() {
    return {
      isMobile: false
    };
  },
  mounted() {
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    this.isMobile = mediaQuery.matches;
    mediaQuery.addEventListener('change', (e) => {
      this.isMobile = e.matches;
    });
  }
};
</script>

<style scoped>
.mobile-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}

.mobile-header {
    font-weight: bold;
    font-size: 40px;
    margin-bottom: 10px;
}

.mobile-logo {
  margin-bottom: 0;
}

.mobile-logo img {
  max-width: 100%;
  height: auto;
}

.mobile-login {
  width: 100%;
}
</style>