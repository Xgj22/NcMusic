// pages/recommendSong/recommendSong.js
import request from "../../utils/request.js"
import PubSub from 'pubsub-js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    month:'',
    day:'',
    index:0,
    recommendList:[]
  },

  // 获取用户每日推荐数据
  async getRecommendList(){
    let recommendListData = await request('/recommend/songs');
    this.setData({
      recommendList: recommendListData.recommend
    })
  },
  toSongDetail(event){
    // 设置index的值
    this.setData({
      index:event.currentTarget.dataset.index
    })
    let musicId = event.currentTarget.id
    wx.navigateTo({
      url:'/pages/songDetail/songDetail?musicId=' + musicId
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 判断用户是否登录
    let userInfo = wx.getStorageSync('userInfo');
    if(!userInfo){
      wx.showToast({
        title: '请先登录',
        icon: 'none',
        success: () => {
          // 跳转至登录界面
          wx.reLaunch({
            url: '/pages/login/login'
          })
        }
      })
    }
    // 更新日期的状态数据
    let p = new Date()
    this.setData({
      day:p.getDate()*1,
      month:p.getMonth()+1
    })
    this.getRecommendList()
    PubSub.subscribe('switchType',(musicId,type)=>{
      let {index,recommendList} = this.data
      if(type=='pre'){
        if(this.data.index!=0){
          index--
        }else{
          index = recommendList.length-1
        }
      }else{
        index++
      }
      console.log(recommendList[index].id)
      PubSub.publish('musicId',recommendList[index].id)
      this.setData({
        index
      })
    })
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
  onShareAppMessage() {

  }
})