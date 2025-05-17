<template>
  <div class="team-search-container">
    <div class="search-filters">
      <el-input placeholder="请输入团队编号" v-model="groupId" class="input-width"></el-input>
      <el-input placeholder="请输入团队名称" v-model="groupName" class="input-width"></el-input>
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
      <el-button type="primary" :loading="isLoading" @click="searchTeams">查询</el-button>
      <el-button type="primary" @click="createTeamParameter.createTeamDialogVisible = true">创建我的团队</el-button>
      <el-dialog title="创建团队" :visible.sync="createTeamParameter.createTeamDialogVisible" width="30%" center>
        <el-form>
          <el-form-item label="请输入团队名称(不超过10个字符)：">
            <el-input v-model="createTeamParameter.groupName"></el-input>
          </el-form-item>
          <el-form-item label="请输入团队人数上限(1-500)：">
            <el-input-number v-model="createTeamParameter.groupNumberMaximum" :min="1" :max="500"></el-input-number>
          </el-form-item>
          <el-form-item label="请输入团队简介(100字符以内)：">
            <el-input v-model="createTeamParameter.groupIntroduction"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button type="primary" :loading="isLoading" @click="handleCreateTeam">创 建</el-button>
          <el-button @click="cancleCreateTeam">取 消</el-button>
        </span>
      </el-dialog>
    </div>
    <el-table :data="filteredTeams" border>
      <el-table-column prop="groupId" label="团队编号" width="80"></el-table-column>
      <el-table-column prop="groupName" label="团队名称" width="200"></el-table-column>
      <el-table-column prop="isFull" label="是否满员" width="80"></el-table-column>
      <el-table-column prop="memberCount" label="人数"></el-table-column>
      <el-table-column prop="createTime" label="创建时间" width="200"></el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button type="text" v-if="scope.row.isFull === '否'" :loading="isLoading" @click="joinTeam(scope.row)">加入</el-button>
          <span v-if="scope.row.isFull === '是'" style="color: blue;">已满员</span>
        </template>
      </el-table-column>
    </el-table>
    <div class="pagination-container">
      <el-button @click="prevPage" :disabled="currentPage === 1">上一页</el-button>
      <span>{{ currentPage }}</span> /
      <span>{{ totalPages }}</span>
      <el-button @click="nextPage" :disabled="currentPage === totalPages">下一页</el-button>
    </div>
    
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      groupId: '',
      groupName: '',
      startDate: '',
      endDate: '',
      groups: [],
      isLoading: false,
      totalCount: 0,
      pageSize: 6,
      currentPage: 1,
      createTeamParameter: {
        createTeamDialogVisible: false,
        groupName: '',
        groupNumberMaximum: 500,
        groupIntroduction: ''
      }
    };
  },
  methods: {
    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
      }
    },
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
      }
    },
    async searchTeams() {
      this.isLoading = true;
      try {
        const response = await axios.get('/api/searchgroup', {
          params: {
            id:this.groupId,
            name:this.groupName,
            begin:this.startDate,
            end:this.endDate
          },
        });
        if(response.data.state == 1){
          this.groups = response.data.groups;
        }
        else if(response.data.state == 2){
          this.$message.error('搜索团队失败，请稍后重试');
        }
      } catch {
        this.$message.error('请求发送失败，请检查网络或联系管理员');
      } finally{
        this.isLoading = false;
      }
    },
    resetFilters() {
      this.groupId = '';
      this.groupName = '';
      this.startDate = '';
      this.endDate = '';
      this.currentPage = 1;
      this.searchTeams();
    },
    joinTeam(row) {
      this.$confirm('是否确定加入团队'+row.groupName, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(async () => {
          this.isLoading = true;
          try {
            const id = this.$store.getters.getid;
            const groupid = row.groupId;
            const response = await axios.post('/api/joingroup', {
              "id":id,
              "groupId":groupid
            });
            if(response.data.state == 1){
              this.$message.success('加入团队成功!');
            }
            else if(response.data.state == 2){
              this.$message.error('加入团队失败!');
            }
          } catch {
            this.$message.error('请求发送失败，请检查网络或联系管理员');
          } finally{
            this.isLoading = false;
          }
        }).catch(() => {
          this.$message('已取消加入');
        });
    },
    handlePageChange(page) {
      this.currentPage = page;
      this.searchTeams();
    },
    async handleCreateTeam() {
      if (this.createTeamParameter.groupName.length > 10
        || this.createTeamParameter.groupName.length == 0) {
        this.$message.warning("请正确输入团队名称!");
        return;
      }
      if (this.createTeamParameter.groupName.includes(' ')) {
        this.$message.warning("团队名称不能出现空格！");
        return;
      }
      if (this.createTeamParameter.groupIntroduction.length > 100) {
        this.$message.warning("团队简介长度超出限制！");
        return;
      }
      this.isLoading = true;
      // 新接口
      try{
        const response = await axios.post('/api/creategroup',{
          "groupName":this.createTeamParameter.groupName,
          "maxMember":this.createTeamParameter.groupNumberMaximum,
          "introduction":this.createTeamParameter.groupIntroduction
        });
        if(response.data.state == 1){
          this.$message.success('创建团队成功！');
          this.cancleCreateTeam();
        }
        else if(response.data.state == 2){
          this.$message.error('创建团队失败！');
        }
      } catch {
        this.$message.error('请求发送失败，请检查网络或联系管理员');
      } finally{
        this.isLoading = false;
      }
    },
    cancleCreateTeam() {
      this.createTeamParameter.createTeamDialogVisible = false;
      this.createTeamParameter.groupIntroduction = '';
      this.createTeamParameter.groupName = '';
      this.createTeamParameter.groupNumberMaximum = 1;
    }
  },
  mounted() {
    this.searchTeams();
  },
  computed: {
    filteredTeams() {
      // 先根据你的筛选条件（如果有）过滤原始团队数据 teams
      // 这里假设没有额外筛选条件，直接处理
      const startIndex = (this.currentPage - 1) * this.pageSize;
      const endIndex = startIndex + this.pageSize;
      return this.groups.slice(startIndex, endIndex);
    },
    totalPages() {
      return this.groups.length === 0? 1 : Math.ceil(this.groups.length / this.pageSize);
    }
  }
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
.pagination-container {
    text-align: center;
    margin-top: 20px;
}
</style>