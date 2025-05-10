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
    <el-table :data="filteredTeams" border>
      <el-table-column prop="teamId" label="团队编号" width="80"></el-table-column>
      <el-table-column prop="teamName" label="团队名称" width="200"></el-table-column>
      <el-table-column prop="isFull" label="是否满员" width="80"></el-table-column>
      <el-table-column prop="memberCount" label="人数"></el-table-column>
      <el-table-column prop="createTime" label="创建时间" width="200"></el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button type="text" @click="joinTeam(scope.row)">加入</el-button>
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
      teamId: '',
      teamName: '',
      startDate: '',
      endDate: '',
      teams: [
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
        },
      ],

      totalCount: 0,
      pageSize: 6,
      currentPage: 1,
      createTeamParameter: {
        createTeamDialogVisible: false,
        teamName: '',
        teamNumberMaximum: 1,
        teamIntroduction: ''
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
      try {
        const response = await axios.get('/api/searchteams', {
          params: {
            id:this.teamId,
            name:this.teamName,
            begin:this.startDate,
            end:this.endDate
          },
        });
        this.teams = response.data.teams;
        // 这里无需额外操作，因为 computed 会自动重新计算
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
      this.$confirm('是否确定加入团队'+row.teamName, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(async () => {
          try {
            const id = this.$store.getters.getid;
            const teamid = row.teamId;
            const response = await axios.post('/api/jointeam', {
              "id":id,
              "teamid":teamid
            });
            //待完善
            if(response.data){
              this.$message({
                type: 'success',
                message: '加入团队成功!'
              });
            }
            else{
              this.$message({
                type: 'info',
                message: '加入团队失败!'
              });
            }
          } catch (error) {
            console.error('加入团队失败', error);
          }
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消退出'
          });
        });
    },
    handlePageChange(page) {
      this.currentPage = page;
      this.searchTeams();
    },
    async handleCreateTeam() {
      if (this.createTeamParameter.teamName.length > 10
        || this.createTeamParameter.teamName.length == 0) {
        this.$message.warning("请正确输入团队名称!");
        return;
      }
      if (this.createTeamParameter.teamName.includes(' ')) {
        this.$message.warning("团队名称不能出现空格！");
        return;
      }
      if (this.createTeamParameter.teamIntroduction.length > 100) {
        this.$message.warning("团队简介长度超出限制！");
        return;
      }
      this.createTeamParameter.createTeamDialogVisible = false;
      // 新接口
      await axios.post('/api/createteam',{
        params:{
          "teamname":this.createTeamParameter.teamName,
          "maxmember":this.createTeamParameter.teamNumberMaximum,
          "introduction":this.createTeamParameter.teamIntroduction
        }
      }).then(response => {
        console.log(response);
        this.$message.success('创建成功！');
      }).catch(error => {
        console.log(error);
        this.$message.error('创建失败！');
      })
    },
    cancleCreateTeam() {
      this.createTeamParameter.createTeamDialogVisible = false;
      this.createTeamParameter.teamIntroduction = '';
      this.createTeamParameter.teamName = '';
      this.createTeamParameter.teamNumberMaximum = 1;
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
      return this.teams.slice(startIndex, endIndex);
    },
    totalPages() {
      return this.teams.length === 0? 1 : Math.ceil(this.teams.length / this.pageSize);
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