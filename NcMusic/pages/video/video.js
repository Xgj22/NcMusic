// pages/video/video.js
import request from "../../utils/request"

Page({

  /**
   * 页面的初始数据
   */
  data: {
    videoGroupList:[],
    navId:'',
    videoList:[],
    videoId :'',
    videoUpdateTime:[],
    isTriggered:false
  },

  async getVideoGroupList(){
    let videoGroupListData = await request('/video/group/list')
    if(videoGroupListData.code == 200){
      this.setData({
        videoGroupList:videoGroupListData.data.splice(0,14),
        
      })
    }
    this.setData({
      navId:this.data.videoGroupList[0].id
    })
    // 获取视频列表数据
    this.getVideoList(this.data.navId);
  },

  changeNav(event){
    this.setData({
      navId:+event.currentTarget.id,
      videoList:[]
    })
    wx.showLoading({
      title:'页面正在加载'
    })
    // 改变导航项的时候顺便发请求更新页面
    this.getVideoList(this.data.navId)
  },

  async getVideoList(navId){
    let videoListData = await request('/video/group',{id:navId})
    let index = 0
    let videoList = videoListData.datas.map(item =>{
      item.id = index++
      return item
    })
    this.setData({
      videoList:videoList
    })
    wx.hideLoading()
    console.log(this.data.videoList)
  },

  handlerPlay(event){
    let id = event.currentTarget.id
    this.setData({
      videoId : event.currentTarget.id
    })
    // this.videoContext&&this.videoContext.stop()
    this.videoContext = wx.createVideoContext(id,this.data.videoList[id])
    // 判断当前的视频之前是否播放过，是否有播放记录, 如果有，跳转至指定的播放位置
    let {videoUpdateTime} = this.data;
    let videoItem = videoUpdateTime.find(item => item.vid === id);
    console.log(videoItem)
    if(videoItem){
      // 获取播放的时间点，单位/s
      let timepoint = videoItem.currentTime
      this.timer1 = setTimeout(() => {
          let videoContext1 = wx.createVideoContext(id)
          // 跳转到指定的时间位置
          videoContext1.seek(timepoint)
          videoContext1.play()
          if(this.play){
            this.videoContext.stop()
            this.play = false
            return
          }
          this.play = true
      }, 200)
      return

    } // 情况二：如果没有播放记录，开始新的播放
    // else {
    //     this.timer2 = setTimeout(() => {
    //         let videoContext2 = wx.createVideoContext(vid)
    //         videoContext2.play()
    //     }, 200)
    // }
    this.videoContext.play()
    if(this.play){
      this.videoContext.stop()
      this.play = false
      return
    }
    this.play = true
  },

  // 监听视频播放进度的回调
  handlerTimeUpdate(event){
    let videoTimeObj = {vid: event.currentTarget.id, currentTime: event.detail.currentTime};
    let {videoUpdateTime} = this.data;
    /*
    * 思路： 判断记录播放时长的videoUpdateTime数组中是否有当前视频的播放记录
    *   1. 如果有，在原有的播放记录中修改播放时间为当前的播放时间
    *   2. 如果没有，需要在数组中添加当前视频的播放对象
    *
    * */
    let videoItem = videoUpdateTime.find(item => item.vid === videoTimeObj.vid);
    if(videoItem){ // 之前有
      videoItem.currentTime = event.detail.currentTime;
    }else { // 之前没有
      videoUpdateTime.push(videoTimeObj);
    }
    // 更新videoUpdateTime的状态
    this.setData({
      videoUpdateTime
    })
  },

  handleRefresh(){
    this.setData({
      isTriggered:true
    })
    this.getVideoList(this.data.navId)
    this.setData({
      isTriggered:false
    })
  },
  // 跳转至搜索界面
  toSearch(){
    wx.navigateTo({
      url: '/pages/search/search'
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.getVideoGroupList()
    
    // this.setData({
    //   videoGroupList:videoGroupListData
    // })
    // console.log(this.data.videoGroupList)
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage(event) {
    if(event.from=='button'){
      return {
        title:'我是 button 分享的',
        path:'/pages/video/video',
        imageUrl:'/static/images/personal/bgImg2.jpg'
      }
    }else{
      return {
        title:'我是 menu 分享的',
        path:'/pages/video/video',
        imageUrl:'/static/images/personal/bgImg.jpg'
      }
    }
  }
})