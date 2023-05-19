<template>
  <div class="image-list">
    <div class="action-head">
      <el-radio-group v-model="isCollection" size="mini" @change="loadImages(1)">
        <el-radio-button :label="0">全部</el-radio-button>
        <el-radio-button :label="1">收藏</el-radio-button>
      </el-radio-group>
      <el-button v-if="isShowAdd" size="mini" type="primary" @click="dialogUploadVisible = true"
        >上传素材</el-button
      >
    </div>
    <!-- 素材列表 -->
    <el-row :gutter="10">
      <el-col
        v-for="(img, index) in images"
        :key="index"
        :xs="8"
        :sm="6"
        :md="6"
        :lg="4"
        class="image-item"
        @click.native="selected = index"
      >
        <el-image style="height: 200px; width: 226.4px" :src="img.url" fit="cover"></el-image>
        <div v-if="isShowSelected && selected === index" class="selected"></div>
        <div v-if="isShowAction" class="image-action">
          <!--
            class 样式绑定
             {
                CSS类名: 布尔值
             }
             true：作用类名
             false：不作用类名
           -->
          <el-button
            type="warning"
            :icon="img.is_collected ? 'el-icon-star-on' : 'el-icon-star-off'"
            circle
            size="small"
            :loading="img.loading"
            @click="onCollect(img)"
          ></el-button>
          <el-button
            size="small"
            type="danger"
            icon="el-icon-delete-solid"
            circle
            :loading="img.loading"
            @click="onDelete(img)"
          ></el-button>
        </div>
      </el-col>
    </el-row>
    <!-- /素材列表 -->

    <!-- 数据分页 -->
    <!--
      分页数据改变以后，页码不会变化
      它需要单独处理高亮的页码
     -->
    <el-pagination
      background
      layout="prev, pager, next"
      :total="totalCount"
      :page-size="pageSize"
      :current-page.sync="page"
      @current-change="onPageChange"
    >
    </el-pagination>
    <!-- /数据分页 -->

    <el-dialog title="上传素材" :visible.sync="dialogUploadVisible" :modal-append-to-body="false">
      <el-upload
        ref="upload"
        class="upload-body"
        name="multipartFile"
        action="http://localhost:6002/wemedia/api/v1/material/upload_picture"
        :headers="uploadHeaders"
        :file-list="fileList"
        multiple
        :on-success="onUploadSuccess"
        :auto-upload="false"
      >
        <el-button slot="trigger" size="small" type="primary">选取文件</el-button>
        <div slot="tip" class="el-upload__tip">只能上传jpg/png文件,且不超过500kb</div>
      </el-upload>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogUploadVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitUpload">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { getImages, collectImage, deleteImage } from '@/api/image'

export default {
  name: 'ImageList',
  components: {},
  // 使用对象的方式定义 prop，更严谨，功能更丰富，强烈建议在项目中使用
  // 参考文档：https://cn.vuejs.org/v2/guide/components-props.html#Prop-%E9%AA%8C%E8%AF%81
  props: {
    foo: {
      type: Number,
      // required: true,
      default: 123
    },
    // 是否显示添加素材
    isShowAdd: {
      type: Boolean, // 布尔值
      default: true // 默认值
    },

    // 是否显示图片下方的操作（收藏和删除）
    isShowAction: {
      type: Boolean,
      default: true
    },

    isShowSelected: {
      type: Boolean,
      default: false
    }
  },
  // 使用数组声明 prop，不建议，不够严谨，而且功能也不够强大，仅适合 demo 演示
  // props: ['dsadsadsa'],
  data() {
    const token = JSON.parse(window.localStorage.getItem('token'))
    return {
      fileList: [],
      isCollection: 0, // 默认查询全部素材列表
      images: [], // 图片素材列表
      dialogUploadVisible: false,
      uploadHeaders: {
        token: token
      },
      totalCount: 0, // 总数据条数
      pageSize: 20, // 每页大小
      page: 1, // 当前页码
      selected: null // 选中的索引
    }
  },
  computed: {},
  watch: {},
  created() {
    // 页面初始化加载第 1 页数据
    this.loadImages(1)
  },
  mounted() {},
  methods: {
    submitUpload() {
      this.$refs.upload.submit()
      this.dialogUploadVisible = false
    },
    loadImages(page = 1) {
      // 重置高亮页码，防止数据和页码不对应
      this.page = page
      getImages({
        isCollection: this.isCollection,
        page,
        size: this.pageSize
      }).then((res) => {
        const results = res.data
        results.forEach((img) => {
          // img 对象本来没有 loading 数据
          // 我们这里收到的往里面添加该数据是用来控制每个收藏按钮的 loading 状态
          img.loading = false
        })
        this.images = results
        this.totalCount = res.data.data.total_count
      })
    },

    // onCollectChange () {
    //   this.loadImages(1)
    // },

    onUploadSuccess() {
      // 关闭对话框
      this.dialogUploadVisible = false

      // 更新素材列表
      this.loadImages(this.page)

      this.$message({
        type: 'success',
        message: '上传成功'
      })
    },

    onPageChange(page) {
      this.loadImages(page)
    },

    onCollect(img) {
      // 展示 loading
      img.loading = true
      collectImage(img.id, !img.is_collected).then((res) => {
        // 更新视图状态
        img.is_collected = !img.is_collected
        // 关闭 loading
        img.loading = false
      })
      // if (img.is_collected) {
      //   // 已收藏，取消收藏
      //   collectImage(img.id, false)
      // } else {
      //   // 没有收藏，添加收藏
      //   collectImage(img.id, true)
      // }
    },

    onDelete(img) {
      img.loading = true
      deleteImage(img.id).then((res) => {
        // 重新加载数据列表
        this.loadImages(this.page)
        img.loading = false
      })
    }
  }
}
</script>

<style scoped lang="less">
.action-head {
  padding-bottom: 20px;
  display: flex;
  justify-content: space-between;
}

.image-item {
  position: relative;
}

.image-action {
  font-size: 25px;
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  color: #fff;
  height: 40px;
  background-color: rgba(204, 204, 204, 0.5);
  position: absolute;
  bottom: 4px;
  left: 5px;
  right: 5px;
}

.selected {
  background: url(./selected.png) no-repeat;
  background-size: cover;
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  top: 0;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
