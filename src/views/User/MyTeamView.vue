
<template>
  <div>
    <div class="loading-overlay" v-if="isLoading">
      <div class="loading-spinner"></div>
    </div>
    <div class="team-container">
      <h3 class="small">我加入的团队</h3>
      <el-table :data="paginatedJoinedTeams" border>
        <el-table-column prop="groupId" label="团队编号" align="center" width="80"></el-table-column>
        <el-table-column prop="groupName" label="团队名称" align="center"></el-table-column>
        <el-table-column prop="memberCount" label="人数" width="isMobile?40:130" align="center"></el-table-column>
        <el-table-column v-if="!isMobile" prop="createTime" label="创建时间" width="180" align="center"></el-table-column>
        <el-table-column label="操作" align="center">
          <template slot-scope="scope">
            <el-button type="text" @click="handleExit(scope.row)">退出团队</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination">
        <el-button size="mini" @click="joinedPage > 1 ? joinedPage-- : null">上一页</el-button>
        <span>{{ joinedPage }}/{{ joinedTotalPages }}</span>
        <el-button size="mini" @click="joinedPage < joinedTotalPages ? joinedPage++ : null">下一页</el-button>
      </div>

      <h3 class="small">我管理的团队</h3>
      <el-table :data="paginatedManagedTeams" border>
        <el-table-column prop="groupId" label="团队编号" align="center" width="80"></el-table-column>
        <el-table-column prop="groupName" label="团队名称" align="center"></el-table-column>
        <el-table-column prop="memberCount" label="人数" width="isMobile?40:70" align="center"></el-table-column>
        <el-table-column v-if="!isMobile" prop="createTime" label="创建时间" width="180" align="center"></el-table-column>
        <el-table-column label="操作" align="center" width="310">
          <template slot-scope="scope">
            <div style="display: flex;">
              <el-button type="text" @click="getGroupInfo(scope.row.groupId)">查看团队信息</el-button>
              <el-button type="text" @click="postTask(scope.row)">发布打卡任务</el-button>
              <el-button type="text" @click="deleteGroup(scope.row)">解散团队</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination">
        <el-button size="mini" @click="managedPage > 1 ? managedPage-- : null">上一页</el-button>
        <span>{{ managedPage }}/{{ managedTotalPages }}</span>
        <el-button size="mini" @click="managedPage < managedTotalPages ? managedPage++ : null">下一页</el-button>
      </div>
      
      <el-dialog title="团队详情" :visible.sync="groupInfoDialogVisible" width="85%" style="margin-top:-5%" center>
        <div style="display: flex; width: 100%; gap:50px;">
          <div style="text-align: center;"><!-- 原团队成员信息表格，调整宽度 -->
            <h3 >团队成员信息</h3>
            <el-table :data="currentPageMembers" style="width: 100%;">
                <el-table-column prop="name" label="昵称" width="100" align="center"></el-table-column>
                <el-table-column prop="id" label="账号" width="85" align="center"></el-table-column>
                <el-table-column prop="phoneNumber" label="手机号" width="120" align="center"></el-table-column>
                <el-table-column label="操作" width="80" align="center">
                  <template #default="scope">
                    <el-button type="text" @click="removeMember(scope.row)">移出团队</el-button>
                  </template>
                </el-table-column>
            </el-table>
            <div class="pagination">
              <el-button @click="prevMemberPage" :disabled="memberCurrentPage === 1">上一页</el-button>
              <span>{{ memberCurrentPage }}</span> /
              <span>{{ totalMemberPages }}</span>
              <el-button @click="nextMemberPage" :disabled="memberCurrentPage === totalMemberPages">下一页</el-button>
            </div>
          </div>
          <div style="text-align: center;"><!-- 新增的打卡任务表格 -->
              <h3>打卡任务列表</h3>
              <el-table :data="currentPageTasks" style="width: 100%;" >
                <el-table-column prop="name" label="任务名称" width="100" align="center"></el-table-column>
                <el-table-column prop="id" label="编号" width="70" align="center"></el-table-column>
                <el-table-column label="完成情况" align="center">
                  <template #default="scope">
                    <span>{{ scope.row.actualCount }}/{{ scope.row.shouldCount }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="endTime" label="截至时间" width="150" align="center"></el-table-column>
                <el-table-column label="操作" width="150" align="center">
                    <template #default="scope">
                      <el-button type="text" @click="getTaskDetail(scope.row)">查看详情</el-button>
                      <el-button type="text" @click="deleteTask(scope.row)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
            <div class="pagination">
              <el-button @click="prevTaskPage" :disabled="taskCurrentPage === 1">上一页</el-button>
              <span>{{ taskCurrentPage }}</span> /
              <span>{{ totalTaskPages }}</span>
              <el-button @click="nextTaskPage" :disabled="taskCurrentPage === totalTaskPages">下一页</el-button>
            </div>
          </div>
          <el-dialog width="40%" title="打卡任务详细信息" :visible.sync="taskDetailsDialogVisible" append-to-body center>
            <div class="task-detail-container">
              <p class="task-item">
                <span class="task-label">任务名称：</span>
                <span class="task-value">{{ taskDetails.name }}</span>
              </p>
              <p class="task-item">
                <span class="task-label">任务描述：</span>
                <span class="task-value">{{ taskDetails.description }}</span>
              </p>
              <p class="task-item">
                <span class="task-label">开始时间：</span>
                <span class="task-value">{{ taskDetails.beginTime }}</span>
              </p>
              <p class="task-item">
                <span class="task-label">结束时间：</span>
                <span class="task-value">{{ taskDetails.endTime }}</span>
              </p>
              <p class="task-item">
                <span class="task-label">已完成打卡成员：</span>
                <span class="task-value">{{ taskDetails.completedNameList.join(', ') }}</span>
              </p>
              <p class="task-item">
                <span class="task-label">未完成打卡成员：</span>
                <span class="task-value">{{ taskDetails.incompleteNameList.join(', ') }}</span>
              </p>
              <p class="task-item">
                <span class="task-label">任务类型：</span>
                <span class="task-value">{{ taskDetails.type === '都' ? '人脸识别 + 定位打卡' : taskDetails.type }}</span>
              </p>
            </div>
          </el-dialog>
        </div>
        <span slot="footer" class="dialog-footer">
            <el-button type="primary" @click="closeTeamMember">退 出</el-button>
        </span>
      </el-dialog>
      
      <el-dialog name="发布打卡任务" :visible.sync="postTaskDialogVisible" width="55%" center style="margin-top:-5%; padding:0">
        <el-form ref="taskFormRef" :model="newTask" :rules="rules" label-width="100px" size="small" > 
          <el-form-item label="任务名称" prop="name">
            <el-input v-model="newTask.name" placeholder="请输入任务名称" />
          </el-form-item>

          <el-form-item label="任务描述" prop="description">
            <el-input type="textarea" v-model="newTask.description" :rows="1" placeholder="请输入任务描述"/>
          </el-form-item>

          <el-form-item label="打卡类型" prop="checkinType">
            <el-checkbox-group v-model="newTask.checkinType">
              <el-checkbox label="人脸识别" />
              <el-checkbox label="定位打卡" />
            </el-checkbox-group>
          </el-form-item>

          <el-form-item label="打卡时段">
            <el-date-picker
              v-model="newTask.startTime"
              type="datetime"
              placeholder="开始日期时间"
              :picker-options="{
                shortcuts: false,
                format: 'yyyy-MM-dd HH:mm',
                valueFormat: 'yyyy-MM-dd HH:mm'
              }"
            />
            <span class="mx-2">至</span>
            <el-date-picker
              v-model="newTask.endTime"
              type="datetime"
              placeholder="结束日期时间"
              :picker-options="{
                shortcuts: false,
                format: 'yyyy-MM-dd HH:mm',
                valueFormat: 'yyyy-MM-dd HH:mm'
              }"
            />
          </el-form-item>
          
          <!-- 定位设置 - 集成地图选择 -->
            <el-form-item label="定位设置" v-if="newTask.checkinType.includes('定位打卡')">
              <div class="map-search-container">
                <el-input v-model="searchKeyword" placeholder="搜索地点" clearable @keyup.enter.native="searchPlace" />
                <el-button @click="searchPlace" icon="el-icon-search" style="margin: 0;">搜索</el-button>
                <el-button @click="locateToCurrentPosition" icon="el-icon-location" style="margin: 0;">定位当前位置</el-button>
              </div>
              
              <!-- 百度地图容器 -->
              <div class="map-container" style="max-height: 250px;max-width: 460px;">
                <!-- 确保地图容器有唯一ID -->
                <div id="baidu-map-container" class="bm-view"></div>
                <div class="selected-address">
                  <span v-if="selectedAddress">已选择: {{ selectedAddress }}</span>
                  <span v-else class="text-gray-400">请在地图上选择打卡位置</span>
                </div>
              </div>
              打卡精度选择：
              <el-radio-group v-model="newTask.accuracy" @change="drawCircle(selectedPoint ? new window.BMap.Point(selectedPoint.lng, selectedPoint.lat) : null)">
                <el-radio label="50m">50米</el-radio>
                <el-radio label="100m">100米</el-radio>
                <el-radio label="200m">200米</el-radio>
                <el-radio label="500m">500米</el-radio>
              </el-radio-group>
            </el-form-item>

          <el-form-item label="二维码设置">
            <el-switch
              v-model="newTask.isQRcode"
              active-text="启用"
              inactive-text="禁用"
            />
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button type="primary" @click="handlePostTask">发 布</el-button>
          <el-button @click="cancelPostTask">取 消</el-button>
        </span>
      </el-dialog>
    </div>
  </div>
</template>

<script>
/* eslint-disable vue/no-side-effects-in-computed-properties */
import axios from 'axios';

export default {
  data() {
    return {
      //查看打卡详情
      taskDetails:{
        "id": 221112,
        "name": "测试数据2",
        "description": "请在 9:00 - 9:30 之间完成打卡",
        "beginTime": "2024-10-01 09:00:00",
        "endTime": "2024-10-01 09:30:00",
        "completedNameList":['帅气的xb','帅气的xb','帅气的xb','帅气的xb','帅气的xb','帅气的xb','帅气的xb',],
        "incompleteNameList":[],
        "type":'人脸识别'
      },
      currentTeam: {
        memberlist: [],
        tasklist:[]
      }, // 用于存储当前查看成员信息的团队对象，包含tasklist属性和memberlist属性
      currentTeamId:'', //当前展示成员详情的团队id
      allJoinedTeams: [], // 存储所有加入的团队数据
      allManagedTeams: [], // 存储所有管理的团队数据
      joinedPage: 1,
      managedPage: 1,
      pageSize: 3, // 每页显示3条数据
      //isLoading: false,
      memberList: [], // 存储当前页要展示的成员信息
      memberCurrentPage: 1, // 当前成员信息列表的页码
      memberPageSize: 4, // 每页显示的成员数量
      taskCurrentPage: 1, // 当前任务列表的页码
      taskPageSize: 4,    // 任务每页显示数量
      groupInfoDialogVisible:false,
      postTaskDialogVisible :false,
      taskDetailsDialogVisible:false,
      isLoading:true,
      searchKeyword: '',
      map: null,
      geocoder: null,
      mapCenter: { lng: 116.404, lat: 39.915 }, // 默认地图中心（北京）
      mapApiLoaded: false, // 地图API加载状态
      mapInitialized: false, // 地图初始化状态
      selectedPoint: null,
      selectedAddress: '',   //是否已选择地址
      isMobile:false,
      newTask: {
        name: "",             // 改为与API一致的字段名
        description: "",
        startTime: "",
        endTime: "",
        groupId: "",           // 团队ID
        checkinType: [],      // 打卡类型
        isQRcode: false,      // 是否启用二维码
        location: "",         // 打卡地点名称
        locationDetail: "",   // 详细地址
        Latitude:"",         //维度
        Longitude:"",          //经度
        accuracy: "",  // 定位精度（如"100m"）
        mapLoadRetries:0,      //地图加载次数
        circleOverlay: null, // 新增：存储地图上绘制的圆实例
      },
      rules: {
        name: [
          { required: true, message: '请输入任务名称', trigger: 'blur' },
          { min: 2, max: 15, message: '长度在 2 到 15 个字符', trigger: 'blur' }
        ],
        checkinType: [
          { type: 'array', required: true, message: '请至少选择一种打卡类型', trigger: 'change' }
        ],
        location: [
          { required: true, message: '请输入打卡地点', trigger: 'blur' },
          { min: 2, message: '长度至少 2 个字符', trigger: 'blur' }
        ]
      }
    };
  },
  beforeDestroy() {
    // 清理地图资源
    if (this.map) {
      this.map.clearOverlays();
      this.map = null;
    }
  },
  computed: {
    // 计算当前页需要显示的加入的团队数据
    paginatedJoinedTeams() {
      let start = (this.joinedPage - 1) * this.pageSize;
      let end = start + this.pageSize;
      if(this.allJoinedTeams.slice(start, end).length == 0 && this.joinedPage > 1){
        this.joinedPage = this.joinedPage - 1;
        start = start - this.pageSize;
        end = end - this.pageSize;
      }
      return this.allJoinedTeams.slice(start, end);
    },
    // 计算当前页需要显示的管理的团队数据
    paginatedManagedTeams() {
      let start = (this.managedPage - 1) * this.pageSize;
      let end = start + this.pageSize;
      if(this.allManagedTeams.slice(start, end).length == 0 && this.managedPage > 1){
        this.managedPage = this.managedPage - 1;
        start = start - this.pageSize;
        end = end - this.pageSize;
      }
      return this.allManagedTeams.slice(start, end);
    },
    currentPageMembers() {
        const startIndex = (this.memberCurrentPage - 1) * this.memberPageSize;
        const endIndex = startIndex + this.memberPageSize;
        return this.currentTeam.memberlist.slice(startIndex, endIndex);
    },
    // 计算加入的团队总页数
    joinedTotalPages() {
      return Math.max(1, Math.ceil(this.allJoinedTeams.length / this.pageSize));
    },
    // 计算管理的团队总页数
    managedTotalPages() {
      return Math.max(1, Math.ceil(this.allManagedTeams.length / this.pageSize));
    },
    totalMemberPages() {
      return Math.ceil(this.currentTeam.memberlist.length / this.memberPageSize);
    },
    currentPageTasks() {
      const startIndex = (this.taskCurrentPage - 1) * this.taskPageSize;
      const endIndex = startIndex + this.taskPageSize;
      return this.currentTeam.tasklist.slice(startIndex, endIndex);
    },
    totalTaskPages() {
      return Math.ceil(this.currentTeam.tasklist.length / this.taskPageSize);
    }
  },
  mounted() {
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    this.isMobile = mediaQuery.matches;
    mediaQuery.addEventListener('change', (e) => {
      this.isMobile = e.matches;
    });
    if(this.isMobile){
      this.pageSize = 4;
    }
    this.$nextTick(() => {
    this.checkMapApiLoaded();
  });
    this.fetchAllTeams();
  },
  watch: {
      'newTask.checkinType': {
        handler(newVal) {
          if (newVal.includes('定位打卡')) {
            // 如果勾选了定位打卡且地图未初始化，则初始化
            if (this.mapApiLoaded && !this.mapInitialized) {
              this.initMap();
            }
          } else {
            // 如果取消勾选，清理地图资源
            this.clearMapResources();
          }
        },
        deep: true
      }
    },
  methods: {
    async getTaskDetail(row){
      try{
        const response = await axios.get(`/api/task?id=${row.id}`);
        if(response.data.state == 1){
          this.taskDetailsDialogVisible = true;
          this.taskDetails = response.data.data;
          this.taskDetails.beginTime = this.taskDetails.beginTime.replace("T"," ");
          this.taskDetails.endTime = this.taskDetails.endTime.replace("T"," ");
        }
        else if(response.data.state == 2){
          this.$message.error('获取任务详情失败');
        }
      } catch{
        this.$message.error('请求发送失败，请检查网络或联系管理员')
      }
    },
    async getGroupInfo(groupId){
      this.currentTeamId = groupId;
      this.groupInfoDialogVisible = true;
      try{
        const response = await axios.get(`/api/group?groupId=${groupId}`);
        if(response.data.state == 1){
          this.currentTeam.memberlist = response.data.data.memberlist;
          this.currentTeam.tasklist = response.data.data.tasklist.map(task => ({
            ...task,
            endTime:task.endTime.replace("T"," ")
          }))
        }
        else if(response.data.state == 2){
          this.$message.error('获取团队信息失败！');
        }
      } catch{
        this.$message.error('请求发送失败，请检查网络或联系管理员');
      }
      
    },
    async fetchAllTeams() {
      this.isLoading = true;
      try {
        const id = this.$store.getters.getid;
        const [joinedResponse, managedResponse] = await Promise.all([
          axios.get(`/api/getjoinedgroups?id=${id}`),
          axios.get(`/api/getmanagedgroups?id=${id}`)
        ]);
        if(joinedResponse.data.state === 1){
          this.allJoinedTeams = joinedResponse.data.data.joinedGroups.map(group => ({
            ...group,
            createTime:group.createTime.replace("T"," ")
          })) || [];
        } else if(joinedResponse.data.state === 2){
          this.$message.error('获取加入团队信息失败！');
        }
        if(managedResponse.data.state === 1){
          this.allManagedTeams = managedResponse.data.data.manegedGroups.map(group => ({
            ...group,
            createTime:group.createTime.replace("T"," ")
          })) || [];
        } else if(managedResponse.data.state === 2){
          this.$message.error('获取管理团队信息失败！');
        }
      } catch {
        this.$message.error('请求发送失败，请检查网络或联系管理员');
      } 
      finally{
        this.isLoading = false;
      }
    },
    async handleExit(row){
      this.$confirm('是否确定退出团队'+row.groupName, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(async () =>{
          const id = this.$store.getters.getid;
          try{
            const response = await axios.post('/api/quitgroup',{
            "id":id,
            "groupId":row.groupId
          });
          if(response.data.state == 1){
            this.$message.success('退出团队成功！');
            await this.fetchAllTeams();
          }
          else if(response.data.state == 2){
            this.$message.error('退出团队失败！');
          }
          } catch{
            this.$message.error('请求发送失败，请检查网络或联系管理员');
          }
        }).catch(() => {
          this.$message.info('已取消退出');
        })
      
    },

    // 检查地图API加载状态
    checkMapApiLoaded() {
      if (window.BMap) {
        this.mapApiLoaded = true;
        console.log('地图API加载成功');
        
        // 如果对话框已打开，初始化地图
        if (this.postTaskDialogVisible && !this.mapInitialized) {
          this.initMap();
        }
      } else {
        // 增加重试次数限制，避免无限循环
        if (this.mapLoadRetries < 10) {
          this.mapLoadRetries++;
          console.log(`地图API加载中，尝试第${this.mapLoadRetries}次...`);
          setTimeout(() => this.checkMapApiLoaded(), 1000);
        } else {
          console.error('地图API加载失败，尝试次数已达上限');
          this.$message.error('地图加载失败，请刷新页面重试');
        }
      }
    },
    
    // 初始化地图
    initMap() {
      if (!this.mapApiLoaded || this.mapInitialized ||!this.newTask.checkinType.includes('定位打卡')) return;
      try {
        const mapContainer = document.getElementById('baidu-map-container');
        if (!mapContainer) {
          console.error('地图容器未找到，尝试重新获取...');
          this.$nextTick(() => {
            const retryContainer = document.getElementById('baidu-map-container');
            if (retryContainer) {
              this.map = new window.BMap.Map(retryContainer);
              const point = new window.BMap.Point(this.mapCenter.lng, this.mapCenter.lat);
              this.map.centerAndZoom(point, 15);
              this.map.addControl(new window.BMap.NavigationControl());
              this.map.addControl(new window.BMap.ScaleControl());
              this.map.addControl(new window.BMap.OverviewMapControl());
              this.map.enableScrollWheelZoom();
              this.geocoder = new window.BMap.Geocoder();
              this.map.addEventListener('click', (e) => {
                this.selectedPoint = { lng: e.point.lng, lat: e.point.lat };
                this.reverseGeocode(e.point);
                this.drawCircle(e.point); // 点击地图时绘制圆
              });
              this.mapInitialized = true;
              console.log('地图初始化成功');
            }
          });
          return;
        }
        this.map = new window.BMap.Map(mapContainer);
        const point = new window.BMap.Point(this.mapCenter.lng, this.mapCenter.lat);
        this.map.centerAndZoom(point, 15);
        this.map.addControl(new window.BMap.NavigationControl());
        this.map.addControl(new window.BMap.ScaleControl());
        this.map.addControl(new window.BMap.OverviewMapControl());
        this.map.enableScrollWheelZoom();
        this.geocoder = new window.BMap.Geocoder();
        this.map.addEventListener('click', (e) => {
          this.selectedPoint = { lng: e.point.lng, lat: e.point.lat };
          this.reverseGeocode(e.point);
          this.drawCircle(e.point); // 点击地图时绘制圆
        });
        this.mapInitialized = true;
        console.log('地图初始化成功');
      } catch (error) {
        console.error('地图初始化失败:', error);
      }
    },
    drawCircle(point) {
      if (this.circleOverlay) {
        this.map.removeOverlay(this.circleOverlay); // 移除之前绘制的圆
      }
      const radius = this.newTask.accuracy ? parseInt(this.newTask.accuracy.replace('m', '')) : 0;
      if (radius > 0) {
        const circle = new window.BMap.Circle(point, radius, {
          strokeColor: "blue",
          strokeWeight: 2,
          strokeOpacity: 0.5,
          fillColor: "blue",
          fillOpacity: 0.1
        });
        this.map.addOverlay(circle);
        this.circleOverlay = circle;
      }
    },
    
    // 搜索地点
    searchPlace() {
      if (!this.searchKeyword) {
        this.$message.warning('请输入搜索关键词');
        return;
      }
      
      if (!this.mapApiLoaded || !this.map) {
        this.$message.warning('地图API尚未加载完成');
        return;
      }
      
      // 使用百度地图本地搜索
      const local = new window.BMap.LocalSearch(this.map, {
        renderOptions: { map: this.map },
        onSearchComplete: (results) => {
          if (results && results.getCurrentNumPois() > 0) {
            const firstResult = results.getPoi(0);
            this.selectedPoint = { lng: firstResult.point.lng, lat: firstResult.point.lat };
            this.reverseGeocode(firstResult.point);
          } else {
            this.$message.warning('未找到相关地点');
          }
        }
      });
      
      local.search(this.searchKeyword);
    },
    
    // 定位到当前位置
    locateToCurrentPosition() {
      if (!this.mapApiLoaded || !this.map) {
        this.$message.warning('地图API尚未加载完成');
        return;
      }
      
      const geolocation = new window.BMap.Geolocation();
      geolocation.getCurrentPosition((result) => {
        if (result && result.point) {
          this.map.panTo(result.point);
          this.selectedPoint = { lng: result.point.lng, lat: result.point.lat };
          this.reverseGeocode(result.point);
          this.$message.success('定位成功');
        } else {
          this.$message.error(`定位失败，错误码: ${geolocation.getStatus()}`);
        }
      });
    },
    
    // 逆地理编码（坐标转地址）
    reverseGeocode(point) {
      if (!this.geocoder) return;
      this.geocoder.getLocation(point, (result) => {
        if (result) {
          const detailedAddress = [
            result.addressComponents.province,
            result.addressComponents.city,
            result.addressComponents.district,
            result.addressComponents.street,
            result.addressComponents.streetNumber
          ].filter(part => part).join(' ');
          this.selectedAddress = `已选择: ${detailedAddress}`;
          this.newTask.location = `${result.addressComponents.street}${result.addressComponents.streetNumber}`;
          this.newTask.locationDetail = result.address;
          this.newTask.Latitude = point.lat;
          this.newTask.Longitude = point.lng;
        }
      });
    },
    
    // 显示发布任务对话框
    postTask(row) {
      this.postTaskDialogVisible = true;
      this.newTask.groupId = row.groupId;
      
      // 如果地图API已加载但地图尚未初始化，初始化地图
      this.$nextTick(() => {
        if (this.newTask.checkinType.includes('定位打卡') && this.mapApiLoaded && !this.mapInitialized) {
          this.initMap();
        }
      });
    },
    resetNewTask(){
      this.newTask = {
        name: "",           
        description: "",
        startTime: "",
        endTime: "",
        groupId: "",           
        checkinType: [],      
        isQRcode: false,   
        location: "",         
        locationDetail: "",   
        Latitude:"",   
        Longitude:"",  
        accuracy: ""  
      }
    },
    clearMapResources() {
      if (this.map) {
        this.map.clearOverlays(); // 清除地图上的覆盖物，比如标注、多边形等
        this.map = null; // 将地图实例设为null，释放对地图对象的引用
        this.mapInitialized = false; // 将地图初始化状态标记为false，表明地图已不再处于初始化状态
      }
    },
    // 关闭对话框时重置地图状态
    cancelPostTask() {
      this.resetNewTask();
      this.postTaskDialogVisible = false;
      this.mapInitialized = false; // 重置地图初始化状态
    },
    prevMemberPage() {
      if (this.memberCurrentPage > 1) {
          this.memberCurrentPage--;
          // 无需额外获取数据，计算属性会自动更新memberList
      }
    },
    nextMemberPage() {
        const totalPages = Math.ceil(this.currentTeam.memberlist.length / this.memberPageSize);
        if (this.memberCurrentPage < totalPages) {
            this.memberCurrentPage++;
            // 无需额外获取数据，计算属性会自动更新memberList
        }
    },
    prevTaskPage() {
      if (this.taskCurrentPage > 1) {
        this.taskCurrentPage--;
      }
    },
    nextTaskPage() {
      if (this.taskCurrentPage < this.totalTaskPages) {
        this.taskCurrentPage++;
      }
    },
    closeTeamMember(){
      this.groupInfoDialogVisible = false;
      this.currentTeamId = '';
      this.fetchAllTeams();
    },

    deleteGroup(row){
      this.$confirm("是否确定将解散团队"+row.groupName, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(async () => {
          try {
            const id = this.$store.getters.getid;
            const groupid = row.groupId;
            const response = await axios.delete(`/api/deletegroup?userId=${id}&groupId=${groupid}`);
            if(response.data.state == 1){
              this.$message.success('解散团队成功!');
              this.fetchAllTeams();
            }
            else if(response.data.state == 2){
              this.$message( '团队解散失败!');
            }
          } catch {
            this.$message.error('请求发送失败，请检查网络或联系管理员');
          }
        }).catch(() => {
          this.$message.info( '已取消解散操作');
        });
    },

    removeMember(row){
      console.log(this.$store.getters.getid)
      if(row.id == this.$store.getters.getid){
        this.$message.error('无法移除创建者自身！');
        return;
      }
      this.$confirm("是否确定将"+row.name+" 移出团队？", '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(async () => {
          try {
            const id = row.id;
            const groupid = this.currentTeamId;
            const response = await axios.post('/api/quitgroup', {
              "id":id,
              "groupId":groupid
            });
            if(response.data.state == 1){
              this.$message.success('移除成功!');
              this.getGroupInfo(this.currentTeamId);
            }
            else if(response.data.state == 2){
              this.$message.error( '移除失败!');
            }
          } catch {
            this.$message.error('请求发送失败，请检查网络或联系管理员');
          }
        }).catch(() => {
          this.$message.error('已取消移除');
        });
    },
    async deleteTask(row) {
      const taskId = row.id;
      this.$confirm("是否确定删除"+row.name+"任务？", '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async ()=>{
        try {
          const response = await axios.delete('/api/deletetask',{
            params:{"id":taskId}
          });
          if(response.data.state == 1){
            this.$message.success('打卡任务删除成功');
            this.getGroupInfo(this.currentTeamId);
            }
          else if(response.data.state == 2){
            this.$message.error('打卡任务删除失败');
          }
        } catch {
          this.$message.error('请求发送失败，请检查网络或联系管理员');
        }
      }).catch(() => {
        this.$message.info( '已取消移除');
      });
    },
    async handlePostTask(){
      if (this.newTask.name.length > 15
        || this.newTask.name.length < 2) {
        this.$message.warning("任务名称应在2-15个字符内!");
        return;
      }
      if (this.newTask.name.includes(' ')) {
        this.$message.warning("任务名称不能出现空格！");
        return;
      }
      if (this.newTask.description.length > 100) {
        this.$message.warning("任务简介长度超出限制！");
        return;
      }
      if (!this.newTask.startTime) {
        this.$message.warning("请输入起始时间！");
        return;
      }
      if (!this.newTask.endTime) {
        this.$message.warning("请输入终止时间！");
        return;
      }
      if (this.newTask.checkinType.length === 0) {
        this.$message.warning("请选择打卡类型！");
        return;
      }
      // 定位打卡验证
        if (this.newTask.checkinType.includes('定位打卡')) {
          if (!this.selectedPoint) {
            this.$message.warning('请在地图上选择打卡位置');
            return;
          }
          
          if (!this.newTask.accuracy) {
            this.$message.warning('请选择定位精度');
            return;
          }
        }
      try {
        //由于茧之殇的规范不一样需要调整
        let type = '';
        if(this.newTask.checkinType.length === 2){
          type = '都';
        }
        else{
          type = this.newTask.checkinType[0];
        }
            const response = await axios.post('/api/createtask', {
              "groupId":this.newTask.groupId,
              "name":this.newTask.name,
              "beginTime":this.newTask.startTime,
              "endTime":this.newTask.endTime,
              "description":this.newTask.description,
              "type":type,
              "isQRcode":this.newTask.isQRcode,
              "latitude":this.newTask.Latitude,
              "longitude":this.newTask.Longitude,
              "accuracy": this.newTask.accuracy.replace('m', '')
            });
            if(response.data.state == 1){
              this.$message.success('发布打卡任务成功!');
              this.cancelPostTask();
            }
            else if(response.data.state == 2){
              this.$message.error('发布打卡任务失败!');
            }
          } catch {
            this.$message.error('请求发送失败，请检查网络或联系管理员');
          }
    }

  }
};
</script>

<style scoped>
.team-container {
  padding: 20px;
}
.pagination {
  text-align: center;
}
.el-button {
  margin: 10px;
}
/* 调整表格行高 */
.el-table .el-table__row {
  height: 36px !important; /* 调整为您需要的行高 */
}

/* 调整单元格内边距 */
::v-deep .el-table .el-table__cell {
  padding: 0 !important; /* 减少上下内边距，水平方向可保持默认 */
}

/* 调整表头行高 */
.el-table .el-table__header-wrapper .el-table__row {
  height: 20px !important; /* 表头行高可单独设置 */
}

.small{
  text-align: center;
  margin: 8px;
}
.mx-2 {
  margin: 0 8px;
}


.el-dialog--center .el-dialog__body {
    text-align: initial;
    padding: 25px 25px 0!important;
}

.el-dialog__body {
    padding: 30px 20px 0;
    color: #606266;
    font-size: 14px;
    word-break: break-all;
}

.dialog-footer {
    padding: 0 20px 10px;
    text-align: right;
    box-sizing: border-box;
}


/* 地图样式 */
.map-container {
  margin-top: 10px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  overflow: hidden;
}
.bm-view {
  height: 300px;
}
.map-search-container {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}
.selected-address {
  padding: 8px;
  background-color: #f5f7fa;
  border-top: 1px solid #ebeef5;
  font-size: 14px;
}
.el-table__header{
  text-align: center;
}


.task-detail-container {
  padding: 20px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
}

.task-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.task-label {
  font-weight: 500;
  width: 120px;
  color: #606266;
}

.task-value {
  flex: 1;
  color: #303133;
}

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




@media (max-width: 768px) {
  .team-container {
    padding: 0;
    min-height: 600px;
  }
}
</style>

