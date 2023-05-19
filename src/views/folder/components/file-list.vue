<template>
  <div class="file-list">
    <div class="action-head">
      <el-radio-group v-model="isCollection" size="mini" @change="loadImages(1)">
        <el-button type="primary" @click="onDownload()"> 批量下载 </el-button>
        <el-button type="warning" @click="onDeleteSelectItem()"> 批量删除 </el-button>
      </el-radio-group>
      <el-button v-if="isShowAdd" size="mini" type="primary" @click="dialogUploadVisible = true">
        上传素材
      </el-button>
    </div>
    <!-- 素材列表 -->
    <el-table
      ref="multipleTable"
      :data="images"
      row-key="index"
      style="width: 100%"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" :reserve-selection="true" width="55" />
      <el-table-column prop="name" label="文件名" width="280" :show-overflow-tooltip="true">
        <template slot-scope="scope">
          <span v-if="scope.row.type === 1">
            <img src="@/assets/icons/svg/folder.svg" width="18px" height="15px" />
            {{ scope.row.fileName }}
          </span>
          <span v-if="scope.row.type === 0">
            <img
              :src="require('@/assets/images/' + matchType(scope.row.url) + '.png')"
              width="18px"
              height="15px"
            />
            {{ scope.row.fileName }}
          </span>
        </template>
      </el-table-column>
      <el-table-column align="right">
        <template slot-scope="scope">
          <span v-if="matchType(scope.row.url) !== 'pdf'">
            <el-button size="mini" @click="onDownload(scope.row.url, scope.row.fileName)">
              下载
            </el-button>
          </span>
          <span v-if="matchType(scope.row.url) === 'pdf'">
            <el-button size="mini" @click="onOpen(scope.row.url)"> 预览 </el-button>
          </span>
          <el-button size="mini" type="danger" @click="onDeleteSelectItem(scope.row.id)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
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
    />
    <!-- /数据分页 -->

    <el-dialog title="上传素材" :visible.sync="dialogUploadVisible" :modal-append-to-body="false">
      <el-upload
        ref="upload"
        class="upload-body"
        name="multipartFile"
        action="http://localhost:6002/wemedia/api/v1/material/dfs/upload"
        :headers="uploadHeaders"
        :file-list="fileList"
        multiple
        :on-success="onUploadSuccess"
        :auto-upload="false"
      >
        <el-button slot="trigger" size="small" type="primary"> 选取文件 </el-button>
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
import { getImages, collectImage, deleteImage, deleteSelectItem, downloadImage } from '@/api/image'
import { matchType } from '@/utils/matchType'
// import {} from '@/views/folder/components/func'

export default {
  name: 'FolderList',
  components: {},
  // 使用对象的方式定义 prop，更严谨，功能更丰富，强烈建议在项目中使用
  // 参考文档：https://cn.vuejs.org/v2/guide/components-props.html#Prop-%E9%AA%8C%E8%AF%81
  props: {
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
      matchType,
      fileList: [],
      isCollection: 0, // 默认查询全部素材列表
      images: [], // 图片素材列表
      multipleSelection: [],
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
        this.totalCount = res.data.total_count
      })
    },

    onUploadSuccess() {
      // 关闭对话框
      this.dialogUploadVisible = false

      // 更新素材列表
      this.loadImages(this.page)

      this.$message({
        type: 'success',
        /*待改为从服务器获取信息*/
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
    },

    onDeleteSelectItem(id) {
      var ids = []
      if (!id) {
        this.multipleSelection.forEach((item) => {
          ids.push(item.id)
        })
      } else {
        ids = [id]
      }
      console.log(ids)
      if (!ids || ids.length <= 0) {
        return this.$message({
          message: '请选择至少一条数据',
          type: 'warning',
          duration: 500
        })
      }
      this.$confirm('确定要删除该文件吗', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        console.log(ids)
        deleteSelectItem(ids).then((res) => {
          // 重新加载数据列表
          this.loadImages(this.page)
        })
        this.multipleSelection = []
      })
    },

    onDownload(fullpath, name) {
      var fullpaths = []
      if (!fullpath) {
        this.multipleSelection.forEach((item) => {
          fullpaths.push(item.url)
        })
      } else {
        fullpaths = [fullpath]
      }
      // console.log(fullpaths)
      if (!fullpaths || fullpaths.length <= 0) {
        return this.$message({
          message: '请选择至少一条数据',
          type: 'warning',
          duration: 500
        })
      }
      fullpaths.forEach((item) => {
        let fileName = matchType(item)
        // var fileNameArray = item.split('/')
        // var fileName = fileNameArray[fileNameArray.length - 1]
        if (fileName === 'pic') {
          this.downloadByBlob(item, name)
        } else {
          window.open(item)
        }
        this.multipleSelection = []
      })
    },
    // download(link) {
    //   const xhr = new XMLHttpRequest()
    //   xhr.open('GET', link)
    //   xhr.responseType = 'blob'
    //   xhr.send()
    //   xhr.onload = function () {
    //     const fileBlob = xhr.response
    //     console.log(fileBlob)
    //     const fileUrl = URL.createObjectURL(fileBlob)
    //     console.log(fileUrl)
    //     const ele = document.createElement('a')
    //     ele.setAttribute('href', fileUrl)
    //     ele.setAttribute('download', '')
    //     ele.click()
    //     ele.innerHTML = '下载'
    //     document.body.appendChild(ele)
    //   }
    // },
    downloadByBlob(url, name) {
      console.log(url)
      let image = new Image()
      image.crossOrigin = 'anonymous'
      image.src = url
      image.onload = () => {
        let canvas = document.createElement('canvas')
        canvas.width = image.width
        canvas.height = image.height
        let ctx = canvas.getContext('2d')
        ctx.drawImage(image, 0, 0, image.width, image.height)
        let baseURL = canvas.toDataURL('image/png') // 得到图片的base64编码数据
        let a = document.createElement('a')
        a.download = name
        a.href = baseURL
        a.click()
      }
    },

    handleSelectionChange(val) {
      this.multipleSelection = val
      console.log(val)
    },

    onOpen(url) {
      window.open(url)
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
</style>
