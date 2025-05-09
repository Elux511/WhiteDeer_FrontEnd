<template>
    <div class="error-page">
        
        <h1>404</h1>
        <p>抱歉，你访问的页面不存在。</p>
        <el-button type="primary" @click="goHome">返回首页</el-button>
        </div>
    </template>
    
    <script>
    export default {
        methods: {
        goHome() {
            this.$router.push('/');
        }
        }
    };
    </script>
    
    <style scoped>
    .error-page {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100vh;
        text-align: center;
    }
    
    h1 {
        font-size: 100px;
        margin-bottom: 20px;
    }
    
    p {
        font-size: 24px;
        margin-bottom: 30px;
    }
    </style>