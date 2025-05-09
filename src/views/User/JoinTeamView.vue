<template>
  <div class="team-search-container">
    <div class="search-filters">
      <el-input placeholder="请输入团队编号" v-model="teamId" class="input-width"></el-input>
      <el-input placeholder="请输入团队名称" v-model="teamName" class="input-width"></el-input>
      <el-date-picker
        v-model="startDate"
        type="date"
        placeholder="创建起始日期"
        class="input-width"
      ></el-date-picker>
      <el-date-picker
        v-model="endDate"
        type="date"
        placeholder="创建终止日期"
        class="input-width"
      ></el-date-picker>
      <el-button type="primary" @click="searchTeams">查询</el-button>
      <el-button type="primary" @click="createTeamParameter.createTeamDialogVisible = true">创建我的团队</el-button>
      <el-dialog title="创建团队" :visible.sync="createTeamParameter.createTeamDialogVisible" width="30%" center>
        <el-form>
          <el-form-item label="请输入团队名称(不超过10个字符)：">
            <el-input v-model="createTeamParameter.teamName"></el-input>
          </el-form-item>
          <el-form-item label="请输入团队人数上限(1-500)：">
            <el-input-number v-model="createTeamParameter.teamNumberMaximum" :min="1" :max="500"></el-input-number>
          </el-form-item>
          <el-form-item label="请输入团队简介(100字符以内)：">
            <el-input v-model="createTeamParameter.teamIntroduction"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button type="primary" @click="handleCreateTeam">确 定</el-button>
          <el-button @click="cancleCreateTeam">取 消</el-button>
        </span>
      </el-dialog>
    </div>
    <el-table :data="teams" border>
      <el-table-column prop="teamId" label="团队编号"></el-table-column>
      <el-table-column prop="teamName" label="团队名称"></el-table-column>
      <el-table-column prop="isFull" label="是否满员"></el-table-column>
      <el-table-column prop="memberCount" label="人数"></el-table-column>
      <el-table-column prop="createTime" label="创建时间"></el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button type="text" @click="joinTeam(scope.row)">加入</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      :total="totalCount"
      :page-size="pageSize"
      :current-page="currentPage"
      @current-change="handlePageChange"
    >
    </el-pagination>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      teamId: '',
      teamName: '',
      startDate: '',
      endDate: '',
      teams: [],
      totalCount: 0,
      pageSize: 10,
      currentPage: 1,
      createTeamParameter:{
        createTeamDialogVisible:false,
        teamName:'',
        teamNumberMaximum:1,
        teamIntroduction:''
      }
    };
  },
  methods: {
    async searchTeams() {
      try {
        const response = await axios.get('/api/search-teams', {
          params: {
            teamId: this.teamId,
            teamName: this.teamName,
            startDate: this.startDate,
            endDate: this.endDate,
            page: this.currentPage,
            size: this.pageSize,
          },
        });
        this.teams = response.data.teams;
        this.totalCount = response.data.totalCount;
      } catch (error) {
        console.error('查询团队失败', error);
      }
    },
    resetFilters() {
      this.teamId = '';
      this.teamName = '';
      this.startDate = '';
      this.endDate = '';
      this.currentPage = 1;
      this.searchTeams();
    },
    joinTeam(row) {
      console.log(`加入团队 ${row.teamName}`);
      // 这里后续补充加入团队的实际逻辑，如发送请求到后端等
    },
    handlePageChange(page) {
      this.currentPage = page;
      this.searchTeams();
    },
    handleCreateTeam(){
      if(this.createTeamParameter.teamName.length > 10
      || this.createTeamParameter.teamName.length == 0){
        this.$message.warning("请正确输入团队名称!");
        return;
      }
      if(this.createTeamParameter.teamName.includes(' ')){
        this.$message.warning("团队名称不能出现空格！");
        return;
      }
      if(this.createTeamParameter.teamIntroduction.length > 100){
        this.$message.warning("团队简介长度超出限制！");
        return;
      }
      this.createTeamParameter.createTeamDialogVisible = false;
      //调接口
    },
    cancleCreateTeam(){
      this.createTeamParameter.createTeamDialogVisible = false;
      this.createTeamParameter.teamIntroduction='';
      this.createTeamParameter.teamName='';
      this.createTeamParameter.teamNumberMaximum = 1;
    }
  },
};
</script>

<style scoped>
.team-search-container {
  padding: 20px;
}
.search-filters {
  display: flex;
  margin-bottom: 20px;
}
.input-width {
  width: 180px;
  margin-right: 10px;
}
</style>