<template>
  <div class="team-container">
    <h2>我加入的团队</h2>
    <el-table :data="joinedTeams" border>
      <el-table-column prop="name" label="团队名称"></el-table-column>
      <el-table-column prop="memberCount" label="人数"></el-table-column>
      <el-table-column prop="createTime" label="创建时间"></el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button type="text" @click="handleExit(scope.row)">退出</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="pagination">
      <el-button size="mini" @click="joinedPage > 1 ? handlePrev('joined') : null">上一页</el-button>
      <span>{{ joinedPage }}/{{ joinedTotalPages }}</span>
      <el-button size="mini" @click="joinedPage < joinedTotalPages ? handleNext('joined') : null">下一页</el-button>
    </div>

    <h2>我管理的团队</h2>
    <el-table :data="managedTeams" border>
      <el-table-column prop="name" label="团队名称"></el-table-column>
      <el-table-column prop="memberCount" label="人数"></el-table-column>
      <el-table-column prop="createTime" label="创建时间"></el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button type="text" @click="handleManage(scope.row)">管理</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="pagination">
      <el-button size="mini" @click="managedPage > 1 ? handlePrev('managed') : null">上一页</el-button>
      <span>{{ managedPage }}/{{ managedTotalPages }}</span>
      <el-button size="mini" @click="managedPage < managedTotalPages ? handleNext('managed') : null">下一页</el-button>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      joinedTeams: [],
      managedTeams: [],
      joinedPage: 1,
      managedPage: 1,
      joinedTotalPages: 1,
      managedTotalPages: 1,
      pageSize: 10,
      isLoading: true
    };
  },
  mounted() {
    this.fetchJoinedTeams();
    this.fetchManagedTeams();
  },
  methods: {
    async fetchJoinedTeams() {
      try {
        const response = await axios.get(`/api/joined-teams?page=${this.joinedPage}&size=${this.pageSize}`);
        const { data } = response.data;
        this.joinedTeams = data;
        const totalCount = data.length;
        if (totalCount <= this.pageSize) {
          this.joinedTotalPages = 1;
        } else if (totalCount > this.pageSize && totalCount <= this.pageSize * 2) {
          this.joinedTotalPages = 2;
        } else {
          this.joinedTotalPages = Math.ceil(totalCount / this.pageSize);
        }
        this.isLoading = false;
      } catch (error) {
        console.error('获取加入的团队列表失败', error);
        this.isLoading = false;
      }
    },
    async fetchManagedTeams() {
      try {
        const response = await axios.get(`/api/managed-teams?page=${this.managedPage}&size=${this.pageSize}`);
        const { data } = response.data;
        this.managedTeams = data;
        const totalCount = data.length;
        if (totalCount <= this.pageSize) {
          this.managedTotalPages = 1;
        } else if (totalCount > this.pageSize && totalCount <= this.pageSize * 2) {
          this.managedTotalPages = 2;
        } else {
          this.managedTotalPages = Math.ceil(totalCount / this.pageSize);
        }
        this.isLoading = false;
      } catch (error) {
        console.error('获取管理的团队列表失败', error);
        this.isLoading = false;
      }
    },
    handleExit(row) {
      console.log(`退出团队 ${row.name}`);
    },
    handleManage(row) {
      console.log(`管理团队 ${row.name}`);
    },
    handlePrev(type) {
      if (type === 'joined') {
        if (this.joinedPage > 1) {
          this.joinedPage--;
          this.fetchJoinedTeams();
        }
      } else {
        if (this.managedPage > 1) {
          this.managedPage--;
          this.fetchManagedTeams();
        }
      }
    },
    handleNext(type) {
      if (type === 'joined') {
        if (this.joinedPage < this.joinedTotalPages) {
          this.joinedPage++;
          this.fetchJoinedTeams();
        }
      } else {
        if (this.managedPage < this.managedTotalPages) {
          this.managedPage++;
          this.fetchManagedTeams();
        }
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
  margin-top: 10px;
}

.el-button{
  margin: 10px;
}
</style>    