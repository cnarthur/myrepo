/**
 * 素材请求相关模块
 */

import request from '@/utils/request'

/**
 * 上传图片素材
 */
export const uploadImage = (data) => {
  return request({
    method: 'POST',
    url: '/mp/v1_0/user/images',
    /**
     * 正常的文件上传接口要求 Content-Type 设置为 multipart/form-data
     * 一般文件上传的接口都要求把请求头中的 Content-Type 设置为 multipart/form-data，但是我们使用 axios 上传文件的话不需要手动设置，
     * 你只要给 data 一个 FormData 对象即可。
     */
    // new FormData()
    data
  })
}

/**
 * 获取素材列表
 */
export const getImages = (data) => {
  return request({
    method: 'POST',
    url: 'wemedia/api/v1/admin/list',
    data
  })
}

/**
 * 收藏/取消收藏素材
 */
export const collectImage = (imageId, collect) => {
  return request({
    method: 'PUT',
    url: `/mp/v1_0/user/images/${imageId}`,
    data: {
      collect
    }
  })
}

/**
 * 删除素材
 */
export const deleteImage = (imageId) => {
  return request({
    method: 'DELETE',
    url: `/wemedia/api/v1/material/del_file/${imageId}`
  })
}
/**
 * 批量删除素材
 * @param {*} data 素材id集
 * @returns 成功或失败的参数
 */
export const deleteSelectItem = (data) => {
  return request({
    method: 'POST',
    url: '/wemedia/api/v1/material/dfs/del_file',
    // data: JSON.stringify(data)
    data
  })
}

/**
 * 下载素材
 */
export const downloadImage = (data) => {
  return request({
    // headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    method: 'POST',
    url: data,
    responseType: 'arraybuffer'
  }).then((res) => {
    console.log(res)
    if (res.status == 200) {
      res.data.forEach((item) => {
        console.log(item)
        const b = new Blob([item])
        let url = window.URL.createObjectURL(new Blob([res])) // 将获取的文件转化为blob格式
        let a = document.createElement('a') // 此处向下是打开一个储存位置
        a.style.display = 'none'
        a.href = url
        // 下面两行是自己项目需要的处理，总之就是得到下载的文件名（加后缀）即可
        var fileNameArray = fullpath.split('/')
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
