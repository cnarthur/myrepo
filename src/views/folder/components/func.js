import { deleteSelectItem, downloadImage } from '@/api/image'
import FolderList from './components/file-list'

export function onDeleteSelectItem(id) {
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
}

export function onDownload(url) {
  var urls = []
  if (url == null && !(url.length > 0)) {
    this.multipleSelection.forEach((item) => {
      urls.push(item.url)
    })
  } else {
    urls = [url]
  }
  console.log(urls)
  if (!urls || urls.length <= 0) {
    return this.$message({
      message: '请选择至少一条数据',
      type: 'warning',
      duration: 500
    })
  }
  downloadImage(urls).then((res) => {
    if (res.status == 200) {
      res.data.data.forEach((item) => {
        let url = window.URL.createObjectURL(new Blob([item])) // 将获取的文件转化为blob格式
        let a = document.createElement('a') // 此处向下是打开一个储存位置
        a.style.display = 'none'
        a.href = url
        var fileNameArray = path.split('#')[1].split('/')
        var fileName = fileNameArray[fileNameArray.length - 1]
        a.setAttribute('download', fileName)
        document.body.appendChild(a)
        a.click() //点击下载
        document.body.removeChild(a) // 下载完成移除元素
        window.URL.revokeObjectURL(url) // 释放掉blob对象
        this.$message.success('文件下载成功') //删除弹窗
      })
    } else {
      this.$message.error('下载失败')
    }
    this.multipleSelection = []
  })
}
