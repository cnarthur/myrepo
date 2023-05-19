<template>
  <div class="file-container">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <!-- 面包屑路径导航 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item to="/">首页</el-breadcrumb-item>
          <el-breadcrumb-item>文件列表</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- /面包屑路径导航 -->
        <!-- <el-button style="float: right; padding: 3px 0" type="text">操作按钮</el-button> -->
      </div>
      <!-- 图片列表 -->
      <folder-list />
      <!-- /图片列表 -->
    </el-card>
  </div>
</template>

<script>
import FolderList from './components/file-list'

export default {
  name: 'FolderIndex',
  components: {
    FolderList
  },
  props: {},
  data() {
    return {}
  },
  computed: {},
  watch: {},
  created() {},
  mounted() {},
  methods: {}
}
</script>

<style scoped lang="less"></style>
