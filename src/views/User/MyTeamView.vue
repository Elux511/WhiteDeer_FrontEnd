<template>
  <div class="team-container">
    <h3 class="small">我加入的团队</h3>
    <el-table :data="paginatedJoinedTeams" border>
      <el-table-column prop="teamId" label="团队编号" align="center" width="80"></el-table-column>
      <el-table-column prop="teamName" label="团队名称" align="center"></el-table-column>
      <el-table-column prop="memberCount" label="人数" width="130" align="center"></el-table-column>
      <el-table-column prop="createTime" label="创建时间" width="180" align="center"></el-table-column>
      <el-table-column label="操作" align="center">
        <template slot-scope="scope">
          <el-button type="text" @click="handleExit(scope.row)">退出</el-button>
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
      <el-table-column prop="teamId" label="团队编号" align="center" width="80"></el-table-column>
      <el-table-column prop="teamName" label="团队名称" align="center"></el-table-column>
      <el-table-column prop="memberCount" label="人数" width="120" align="center"></el-table-column>
      <el-table-column prop="createTime" label="创建时间" width="180" align="center"></el-table-column>
      <el-table-column label="操作" align="center" width="240">
        <template slot-scope="scope">
          <div style="display: flex;">
          <el-button type="text" @click="getMemberList(scope.row.teamId)">查看成员信息</el-button>
          <el-button type="text" @click="postTask(scope.row)">发布打卡任务</el-button></div>
        </template>
      </el-table-column>
    </el-table>
    <div class="pagination">
      <el-button size="mini" @click="managedPage > 1 ? managedPage-- : null">上一页</el-button>
      <span>{{ managedPage }}/{{ managedTotalPages }}</span>
      <el-button size="mini" @click="managedPage < managedTotalPages ? managedPage++ : null">下一页</el-button>
    </div>
    
    <el-dialog :visible.sync="teamMemberDialogVisible" width="80%" center>
      <div style="display: flex; width: 100%; gap:50px;">
        <div style="text-align: center;"><!-- 原团队成员信息表格，调整宽度 -->
          <h3 >团队成员信息</h3>
          <el-table :data="currentPageMembers" style="width: 100%;">
              <el-table-column prop="name" label="姓名" width="100"></el-table-column>
              <el-table-column prop="id" label="账号" width="60"></el-table-column>
              <el-table-column prop="phoneNumber" label="手机号" width="120"></el-table-column>
              <el-table-column label="操作" width="100">
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
            <el-table :data="currentPageTasks" style="width: 100%;">
              <el-table-column prop="title" label="任务名称" width="120"></el-table-column>
              <el-table-column prop="id" label="编号" width="60"></el-table-column>
              <el-table-column label="完成情况">
                  <template #default="scope">
                      <span>{{ scope.row.actualCount }}/{{ scope.row.shouldCount }}</span>
                  </template>
              </el-table-column>
              <el-table-column prop="endTime" label="截至时间" width="150"></el-table-column>
              <el-table-column label="操作" width="80">
                  <template #default="scope">
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
      </div>
      <span slot="footer" class="dialog-footer">
          <el-button type="primary" @click="closeTeamMember">退 出</el-button>
      </span>
    </el-dialog>
    
    <el-dialog title="发布打卡任务" :visible.sync="postTaskDialogVisible" width="50%" center>
        <el-form ref="taskFormRef" :model="newTask" :rules="rules" label-width="100px" size="small">
      
      <el-form-item label="任务名称" prop="taskName">
        <el-input v-model="newTask.taskName" placeholder="请输入任务名称" />
      </el-form-item>

      <el-form-item label="任务描述" prop="description">
        <el-input type="textarea" v-model="newTask.description" :rows="2" placeholder="请输入任务描述"/>
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
            <el-button @click="searchPlace" icon="el-icon-search">搜索</el-button>
            <el-button @click="locateToCurrentPosition" icon="el-icon-location">定位当前位置</el-button>
          </div>
          
          <!-- 百度地图容器 -->
          <div class="map-container">
            <baidu-map 
              class="bm-view"
              :center="mapCenter"
              :zoom="15"
              @ready="handleMapReady">
              
              <!-- 地图标记 -->
              <bm-marker 
                v-if="selectedPoint"
                :position="{lng: selectedPoint.lng, lat: selectedPoint.lat}"
                draggable="true"
                @dragend="handleMarkerDragEnd">
              </bm-marker>
              
              <!-- 搜索结果覆盖层 -->
              <bm-local-search 
                v-if="searchKeyword"
                :keyword="searchKeyword"
                :auto-viewport="true"
                @searchcomplete="handleSearchComplete">
              </bm-local-search>
            </baidu-map>
            
            <!-- 显示选中的地址 -->
            <div class="selected-address">
              <span v-if="selectedAddress">已选择: {{ selectedAddress }}</span>
              <span v-else class="text-gray-400">请在地图上选择打卡位置</span>
            </div>
          </div>
          
          <el-form-item label="定位精度" prop="locationAccuracy">
            <el-radio-group v-model="newTask.locationAccuracy">
              <el-radio label="50m">50米</el-radio>
              <el-radio label="100m">100米</el-radio>
              <el-radio label="200m">200米</el-radio>
              <el-radio label="500m">500米</el-radio>
            </el-radio-group>
          </el-form-item>
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
          <el-button @click="canclePostTask">取 消</el-button>
        </span>
    </el-dialog>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      currentTeam: {
        allMemberList: [
        {
          "id":"1",
          "name":"茧之泪殇",
          "phoneNumber":13013013130
        },
        {
          "id":"1",
          "name":"茧之泪殇",
          "phoneNumber":13013013130
        },
        {
          "id":"1",
          "name":"茧之泪殇",
          "phoneNumber":13013013130
        },
        {
          "id":"1",
          "name":"茧之泪殇",
          "phoneNumber":13013013130
        },
        {
          "id":"2",
          "name":"茧之泪殇",
          "phoneNumber":13013013130
        },
        {
          "id":"3",
          "name":"茧之泪殇",
          "phoneNumber":13013013130
        },
        {
          "id":"1",
          "name":"茧之泪殇",
          "phoneNumber":13013013130
        },
        {
          "id":"1",
          "name":"茧之泪殇",
          "phoneNumber":13013013130
        }
      ],
        tasks:[
        {
          "id": 2,
          "title": "测试数据2",
          "description": "请在 9:00 - 9:30 之间完成打卡",
          "startTime": "2024-10-01 09:00:00",
          "endTime": "2024-10-01 09:30:00",
          "createdTime": "2024-10-01 08:00:00",
          "status": "incomplete",
          "punchTime": "2024-10-01 09:15:00",
          "shouldCount": 10,
          "actualCount": 9,
          "teamId": 2,
          "checkinType": ['face_recognition', 'location_checkin']
        },
        {
          "id": 3,
          "title": "测试数据3",
          "description": "请在 9:00 - 9:30 之间完成打卡",
          "startTime": "2024-10-01 09:00:00",
          "endTime": "2024-10-01 09:30:00",
          "createdTime": "2024-10-01 08:00:00",
          "status": "completed",
          "punchTime": "2024-10-01 09:15:00",
          "shouldCount": 10,
          "actualCount": 10,
          "teamId": 2,
          "checkinType": ['face_recognition']
        },{
          "id": 3,
          "title": "测试数据3",
          "description": "请在 9:00 - 9:30 之间完成打卡",
          "startTime": "2024-10-01 09:00:00",
          "endTime": "2024-10-01 09:30:00",
          "createdTime": "2024-10-01 08:00:00",
          "status": "completed",
          "punchTime": "2024-10-01 09:15:00",
          "shouldCount": 10,
          "actualCount": 10,
          "teamId": 2,
          "checkinType": ['face_recognition']
        },{
          "id": 3,
          "title": "测试数据3",
          "description": "请在 9:00 - 9:30 之间完成打卡",
          "startTime": "2024-10-01 09:00:00",
          "endTime": "2024-10-01 09:30:00",
          "createdTime": "2024-10-01 08:00:00",
          "status": "completed",
          "punchTime": "2024-10-01 09:15:00",
          "shouldCount": 10,
          "actualCount": 10,
          "teamId": 2,
          "checkinType": ['face_recognition']
        },{
          "id": 3,
          "title": "测试数据3",
          "description": "请在 9:00 - 9:30 之间完成打卡",
          "startTime": "2024-10-01 09:00:00",
          "endTime": "2024-10-01 09:30:00",
          "createdTime": "2024-10-01 08:00:00",
          "status": "completed",
          "punchTime": "2024-10-01 09:15:00",
          "shouldCount": 10,
          "actualCount": 10,
          "teamId": 2,
          "checkinType": ['face_recognition']
        },{
          "id": 3,
          "title": "测试数据3",
          "description": "请在 9:00 - 9:30 之间完成打卡",
          "startTime": "2024-10-01 09:00:00",
          "endTime": "2024-10-01 09:30:00",
          "createdTime": "2024-10-01 08:00:00",
          "status": "completed",
          "punchTime": "2024-10-01 09:15:00",
          "shouldCount": 10,
          "actualCount": 10,
          "teamId": 2,
          "checkinType": ['face_recognition']
        },{
          "id": 3,
          "title": "测试数据3",
          "description": "请在 9:00 - 9:30 之间完成打卡",
          "startTime": "2024-10-01 09:00:00",
          "endTime": "2024-10-01 09:30:00",
          "createdTime": "2024-10-01 08:00:00",
          "status": "completed",
          "punchTime": "2024-10-01 09:15:00",
          "shouldCount": 10,
          "actualCount": 10,
          "teamId": 2,
          "checkinType": ['face_recognition']
        },{
          "id": 3,
          "title": "测试数据3",
          "description": "请在 9:00 - 9:30 之间完成打卡",
          "startTime": "2024-10-01 09:00:00",
          "endTime": "2024-10-01 09:30:00",
          "createdTime": "2024-10-01 08:00:00",
          "status": "completed",
          "punchTime": "2024-10-01 09:15:00",
          "shouldCount": 10,
          "actualCount": 10,
          "teamId": 2,
          "checkinType": ['face_recognition']
        },
        {
          "id": 4,
          "title": "测试数据4",
          "description": "请在 9:00 - 9:30 之间完成打卡",
          "startTime": "2024-10-01 09:00:00",
          "endTime": "2024-10-01 09:30:00",
          "createdTime": "2024-10-01 08:00:00",
          "status": "completed",
          "punchTime": "2024-10-01 09:15:00",
          "shouldCount": 10,
          "actualCount": 0,
          "teamId": 2,
          "checkinType": ['location_checkin']
        },
        {
          "id": 3,
          "title": "测试数据5",
          "description": "请在 9:00 - 9:30 之间完成打卡",
          "startTime": "2024-10-01 09:00:00",
          "endTime": "2024-10-01 09:30:00",
          "createdTime": "2024-10-01 08:00:00",
          "status": "completed",
          "punchTime": "2024-10-01 09:15:00",
          "shouldCount": 10,
          "actualCount": 10,
          "teamId": 2,
          "checkinType": ['face_recognition']
        }
        ]
      }, // 用于存储当前查看成员信息的团队对象，包含tasks属性
      currentTeamId:'', //当前展示成员详情的团队id
      allJoinedTeams: [
        {
          teamId:1,
          teamName:'茧之泪殇',
          isFull:"否",
          memberCount:'123',
          createTime:'2024-10-01 09:15:00'
        },
        {
          teamId:2,
          teamName:'茧之泪殇',
          isFull:"否",
          memberCount:'123',
          createTime:'2024-10-01 09:15:00'
        },
        {
          teamId:3,
          teamName:'茧之泪殇',
          isFull:"否",
          memberCount:'123',
          createTime:'2024-10-01 09:15:00'
        },
        {
          teamId:1,
          teamName:'茧之泪殇',
          isFull:"否",
          memberCount:'123',
          createTime:'2024-10-01 09:15:00'
        },
        {
          teamId:1,
          teamName:'茧之泪殇',
          isFull:"否",
          memberCount:'123',
          createTime:'2024-10-01 09:15:00'
        },
        {
          teamId:1,
          teamName:'茧之泪殇',
          isFull:"否",
          memberCount:'123',
          createTime:'2024-10-01 09:15:00'
        },
        {
          teamId:1,
          teamName:'茧之泪殇',
          isFull:"否",
          memberCount:'123',
          createTime:'2024-10-01 09:15:00'
        },
        {
          teamId:1,
          teamName:'茧之泪殇',
          isFull:"否",
          memberCount:'123',
          createTime:'2024-10-01 09:15:00'
        },
        {
          teamId:1,
          teamName:'茧之泪殇',
          isFull:"否",
          memberCount:'123',
          createTime:'2024-10-01 09:15:00'
        },
        {
          teamId:1,
          teamName:'茧之泪殇',
          isFull:"否",
          memberCount:'123',
          createTime:'2024-10-01 09:15:00'
        },
        {
          teamId:1,
          teamName:'茧之泪殇',
          isFull:"否",
          memberCount:'123',
          createTime:'2024-10-01 09:15:00'
        },
        {
          teamId:1,
          teamName:'茧之泪殇',
          isFull:"否",
          memberCount:'123',
          createTime:'2024-10-01 09:15:00'
        },
        {
          teamId:1,
          teamName:'茧之泪殇',
          isFull:"否",
          memberCount:'123',
          createTime:'2024-10-01 09:15:00'
        },
        {
          teamId:1,
          teamName:'茧之泪殇',
          isFull:"否",
          memberCount:'123',
          createTime:'2024-10-01 09:15:00'
        },
        {
          teamId:1,
          teamName:'茧之泪殇',
          isFull:"否",
          memberCount:'123',
          createTime:'2024-10-01 09:15:00'
        },
        {
          teamId:1,
          teamName:'茧之泪殇',
          isFull:"否",
          memberCount:'123',
          createTime:'2024-10-01 09:15:00'
        },
        {
          teamId:1,
          teamName:'茧之泪殇',
          isFull:"否",
          memberCount:'123',
          createTime:'2024-10-01 09:15:00'
        },
        {
          teamId:1,
          teamName:'茧之泪殇',
          isFull:"否",
          memberCount:'123',
          createTime:'2024-10-01 09:15:00'
        },
        {
          teamId:1,
          teamName:'茧之泪殇',
          isFull:"否",
          memberCount:'123',
          createTime:'2024-10-01 09:15:00'
        },
        {
          teamId:1,
          teamName:'茧之泪殇',
          isFull:"否",
          memberCount:'123',
          createTime:'2024-10-01 09:15:00'
        }
      ], // 存储所有加入的团队数据
      allManagedTeams: [
        {
          teamId:1,
          teamName:'茧之泪殇',
          isFull:"否",
          memberCount:'123',
          createTime:'2024-10-01 09:15:00'
        },
        {
          teamId:2,
          teamName:'茧之泪殇',
          isFull:"否",
          memberCount:'123',
          createTime:'2024-10-01 09:15:00'
        },
        {
          teamId:3,
          teamName:'茧之泪殇',
          isFull:"否",
          memberCount:'123',
          createTime:'2024-10-01 09:15:00'
        },
        {
          teamId:1,
          teamName:'茧之泪殇',
          isFull:"否",
          memberCount:'123',
          createTime:'2024-10-01 09:15:00'
        },
        {
          teamId:1,
          teamName:'茧之泪殇',
          isFull:"否",
          memberCount:'123',
          createTime:'2024-10-01 09:15:00'
        },
        {
          teamId:1,
          teamName:'茧之泪殇',
          isFull:"否",
          memberCount:'123',
          createTime:'2024-10-01 09:15:00'
        },
        {
          teamId:1,
          teamName:'茧之泪殇',
          isFull:"否",
          memberCount:'123',
          createTime:'2024-10-01 09:15:00'
        },
        {
          teamId:1,
          teamName:'茧之泪殇',
          isFull:"否",
          memberCount:'123',
          createTime:'2024-10-01 09:15:00'
        },
        {
          teamId:1,
          teamName:'茧之泪殇',
          isFull:"否",
          memberCount:'123',
          createTime:'2024-10-01 09:15:00'
        },
        {
          teamId:1,
          teamName:'茧之泪殇',
          isFull:"否",
          memberCount:'123',
          createTime:'2024-10-01 09:15:00'
        },
        {
          teamId:1,
          teamName:'茧之泪殇',
          isFull:"否",
          memberCount:'123',
          createTime:'2024-10-01 09:15:00'
        },
        {
          teamId:1,
          teamName:'茧之泪殇',
          isFull:"否",
          memberCount:'123',
          createTime:'2024-10-01 09:15:00'
        },
        {
          teamId:1,
          teamName:'茧之泪殇',
          isFull:"否",
          memberCount:'123',
          createTime:'2024-10-01 09:15:00'
        },
        {
          teamId:1,
          teamName:'茧之泪殇',
          isFull:"否",
          memberCount:'123',
          createTime:'2024-10-01 09:15:00'
        },
        {
          teamId:1,
          teamName:'茧之泪殇',
          isFull:"否",
          memberCount:'123',
          createTime:'2024-10-01 09:15:00'
        }
      
      ], // 存储所有管理的团队数据
      joinedPage: 1,
      managedPage: 1,
      pageSize: 3, // 每页显示3条数据
      isLoading: true,
      memberList: [], // 存储当前页要展示的成员信息
      memberCurrentPage: 1, // 当前成员信息列表的页码
      memberPageSize: 4, // 每页显示的成员数量
      taskCurrentPage: 1, // 当前任务列表的页码
      taskPageSize: 4,    // 任务每页显示数量
      teamMemberDialogVisible:false,
      postTaskDialogVisible :false,
      newTask:{
          "title": "",
          "description": "",
          "startTime": "",
          "endTime": "",
          "createdTime": "",
          "teamId": "",
          "checkinType": [],
          "isQRcode":false,
          "location":'',
          "locationAccuracy":'',
      },
      rules: {
        taskName: [
          { required: true, message: '请输入任务名称', trigger: 'blur' },
          { min: 2, max: 30, message: '长度在 2 到 15 个字符', trigger: 'blur' }
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
  computed: {
    // 计算当前页需要显示的加入的团队数据
    paginatedJoinedTeams() {
      const start = (this.joinedPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      return this.allJoinedTeams.slice(start, end);
    },
    // 计算当前页需要显示的管理的团队数据
    paginatedManagedTeams() {
      const start = (this.managedPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      return this.allManagedTeams.slice(start, end);
    },
    currentPageMembers() {
        const startIndex = (this.memberCurrentPage - 1) * this.memberPageSize;
        const endIndex = startIndex + this.memberPageSize;
        return this.currentTeam.allMemberList.slice(startIndex, endIndex);
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
      return Math.ceil(this.currentTeam.allMemberList.length / this.memberPageSize);
    },
    currentPageTasks() {
      const startIndex = (this.taskCurrentPage - 1) * this.taskPageSize;
      const endIndex = startIndex + this.taskPageSize;
      return this.currentTeam.tasks.slice(startIndex, endIndex);
    },
    totalTaskPages() {
      return Math.ceil(this.currentTeam.tasks.length / this.taskPageSize);
    }
  },
  mounted() {
    this.fetchAllTeams();
  },
  methods: {
    async getMemberList(teamId) {
      this.teamMemberDialogVisible = true;
      try {
        //新接口，获取团队成员列表和打卡任务列表，用于管理员管理团队
          const response = await axios.get(`/api/teaminfo?teamid=${teamId}`);
          this.currentTeam = response.data;
          this.currentTeamId = teamId;
          // 初始获取后，更新当前页成员信息
          this.memberList = this.currentPageMembers;
      } catch (error) {
          console.error('获取团队信息失败', error);
      }
    },
    // 一次性获取所有团队数据
    async fetchAllTeams() {
      try {
        const id = this.$store.getters.getid;
        // 获取加入的团队
        const joinedResponse = await axios.get(`/api/joinedteams?id=${id}`);
        this.allJoinedTeams = joinedResponse.data.data || [];
        
        // 获取管理的团队
        const managedResponse = await axios.get(`/api/managedteams?id=${id}`);
        this.allManagedTeams = managedResponse.data.data || [];
        
        this.isLoading = false;
      } catch (error) {
        console.error('获取团队列表失败', error);
        this.isLoading = false;
      }
    },
    handleExit(row) {
      this.$confirm('是否确定退出团队'+row.teamName, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(async () => {
          try {
            const id = this.$store.getters.getid;
            const teamid = row.teamId;
            const response = await axios.post('/api/quitteam', {
              id:id,
              teamid:teamid
            });
            //待完善
            if(response.data){
              this.$message({
                type: 'success',
                message: '退出团队成功!'
              });
            }
            else{
              this.$message({
                type: 'info',
                message: '退出团队失败!'
              });
            }
          } catch (error) {
            console.error('退出团队失败', error);
          }
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消退出'
          });
        });
    },
    postTask(row){
      this.postTaskDialogVisible = true;
      this.newTask.teamId = row.teamId;
    },
    resetNewTask(){
      this.newTask.taskName = "";
          this.newTask.description = "",
          this.newTask.startTime = "",
          this.newTask.endTime ="",
          this.newTask.createdTime = "",
          this.newTask.teamId = "",
          this.newTask.checkinType = [],
          this.newTask.isQRcode = false,
          this.newTask.locationAccuracy = '',
          this.newTask.location = ''
    },
    async handlePostTask(){
      if (this.newTask.taskName.length > 15
        || this.newTask.taskName.length < 2) {
        this.$message.warning("任务名称应在2-15个字符内!");
        return;
      }
      if (this.newTask.taskName.includes(' ')) {
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
      if (this.newTask.checkinType.includes('定位打卡') && !this.newTask.location) {
        this.$message.warning("请输入打卡位置！");
        return;
      }
      if (this.newTask.checkinType.includes('定位打卡') && !this.newTask.locationAccuracy) {
        this.$message.warning("请选择打卡范围！");
        return;
      }
      try {
            const response = await axios.post('/api/createtask', {
              "teamid":this.newTask.teamId,
              "name":this.newTask.taskName,
              "begintime":this.newTask.startTime,
              "endtime":this.newTask.endTime,
              "description":this.newTask.description,
              "type":this.newTask.checkinType,
              "isQRcode":this.newTask.isQRcode,
              "location":this.newTask.location,
              "radius":this.newTask.locationAccuracy
            });
            //待完善
            if(response.data){
              this.$message({
                type: 'success',
                message: '发布打卡任务成功!'
              });
            }
            else{
              this.$message({
                type: 'info',
                message: '发布打卡任务失败!'
              });
            }
          } catch (error) {
            console.error('发布打卡任务失败', error);
          }
      this.postTaskDialogVisible = false;
      this.resetNewTask();
    },
    canclePostTask(){
      this.resetNewTask();
      this.postTaskDialogVisible = false;
    },
    prevMemberPage() {
      if (this.memberCurrentPage > 1) {
          this.memberCurrentPage--;
          // 无需额外获取数据，计算属性会自动更新memberList
      }
    },
    nextMemberPage() {
        const totalPages = Math.ceil(this.currentTeam.allMemberList.length / this.memberPageSize);
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
      this.teamMemberDialogVisible = false;
      this.currentTeamId = '';
      this.fetchAllTeams();
    },
    removeMember(row){
      this.$confirm("是否确定将"+row.name+" 移出团队？", '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(async () => {
          try {
            const id = row.id;
            const teamid = this.currentTeamId;
            const response = await axios.post('/api/removesb', {
              id:id,
              teamid:teamid
            });
            //待完善
            if(response.data){
              this.$message({
                type: 'success',
                message: '移除成功!'
              });
              this.getMemberList(this.currentTeamId);
            }
            else{
              this.$message({
                type: 'info',
                message: '移除失败!'
              });
            }
          } catch (error) {
            console.error('移除失败', error);
          }
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消移除'
          });
        });
    
    },
    async deleteTask(row) {
      const taskId = row.id;
      this.$confirm("是否确定删除"+row.title+"任务？", '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(async ()=>{
          try {
          await axios.delete('/api/deletetask',{
            params:{"taskid":taskId}
          });
          this.$message.success('打卡任务已成功删除');
          // 重新获取团队信息更新currentTeam
          await this.getMemberList(this.currentTeamId); 
      } catch (error) {
          this.$message.error('删除打卡任务失败，请重试');
      }
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消移除'
          });
        });
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

</style>