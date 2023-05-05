// pages/search/search.js
import request from "../../utils/request.js"
let searchMusic = false
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showKeyword:'',
    keyWords:'',
    searchMusicList:[],
    musicRankList:[],
    historyList:[]
  },

  // 获取默认关键字
  async getDefaultWord(){
    let defaultData = await request('/search/default')
    this.setData({
      showKeyword:defaultData.data.showKeyword
    })
  },
  goSearch(event){
    this.setData({
      keyWords:event.detail.value.trim()
    })
    if(searchMusic){
      return
    }
    searchMusic = true
    this.getSearchMusic(this.data.keyWords)
    setTimeout(()=>{
      searchMusic = false
    },200)
  },
  async getSearchMusic(keywords){
    if(!this.data.keyWords){
      this.setData({
        searchMusicList:[]
      })
      return
    }
    let searchMusicData = await request('/search',{keywords,limit:10})
    let {historyList} = this.data
    // 如果历史记录中有这个值则无需再添加，但是需要移到最前面
    if(historyList.indexOf(keywords)!=-1){
      historyList.splice(historyList.indexOf(searchContent), 1)
    }
    historyList.unshift(keywords)
    this.setData({
      searchMusicList:searchMusicData.result.songs,
      historyList
    })
    // console.log(historyList)
    wx.setStorageSync('searchHistory', historyList)
  },
  async getMusicRank(){
    let musicRankData = await request('/search/hot/detail')
    this.setData({
      musicRankList : musicRankData.data
    })
  },
  // 清空搜索内容
  clearSearchContent(){
    this.setData({
      searchContent: '',
      searchList: []
    })
  },
  
  // 删除搜索历史记录
  deleteSearchHistory(){
    wx.showModal({
      content: '确认删除吗?',
      success: (res) => {
        if(res.confirm){
          // 清空data中historyList
          this.setData({
            historyList: []
          })
          // 移除本地的历史记录缓存
          wx.removeStorageSync('searchHistory');
        }
      }
    })
   
  },
   // 获取本地历史记录的功能函数
   getSearchHistory(){
    let historyList = wx.getStorageSync('searchHistory');
    if(historyList){
      this.setData({
        historyList
      })
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.getDefaultWord()
    this.getMusicRank()
    // 获取历史记录
    this.getSearchHistory();
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