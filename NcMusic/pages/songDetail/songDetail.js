// pages/songDetail/songDetail.js
import request from "../../utils/request"
import moment from "moment"
import PubSub from 'pubsub-js'
// 获取全局实例
// 利用全局变量不会被销毁的特点记录歌曲是否在播放，重新进入时比对Id修改isPlay
const appInstance = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isPlay:false,
    musicId:'',
    songDetail:[],
    musicData:{},
    musicLink:'',
    currentTime:'00:00',
    durationTime:'00:00',
    currentWidth:0
  },

  async getSongDetail(){
    let songDetail = await request('/song/detail',{ids:this.data.musicId})
    // console.log(songDetail)
    // songData.songs[0].dt 单位ms
    let durationTime = moment(songDetail.songs[0].dt).format('mm:ss');
    this.setData({
      songDetail:songDetail.songs,
      durationTime
    })
    // 动态修改窗口标题
    wx.setNavigationBarTitle({
      title: this.data.songDetail[0].al.name
    })
  },

  handleMusicPlay(event){
    console.log(event)
    let isPlay = !this.data.isPlay
    this.setData({
      isPlay
    })
    // if(isPlay){
    //   this.backgroundAudioManager.src = this.data.musicData.url
    //   this.backgroundAudioManager.title = this.data.songDetail[0].al.name
    // }else { // 暂停音乐
    //   this.backgroundAudioManager.pause();
    // }
    let {musicId,musicLink} = this.data
    this.musicControl(isPlay, musicId, musicLink)
  },


  changePlayState(isPlay){
    this.setData({
      isPlay
    })
    // 修改全局音乐播放的状态
    appInstance.globalData.isMusicPlay = isPlay;
  },

  handleSwitch(event){
    let type = event.currentTarget.id
    // 先停止当前播放的音乐
    this.backgroundAudioManager.stop()
    // 订阅函数
    PubSub.publish('switchType',type)
    // 得到上/下首歌的id
    PubSub.subscribe('musicId',(musicId,msg)=>{
      // 获取音乐详情信息
      this.setData({
        musicId:msg
      })
      this.getSongDetail();
      // 自动播放当前的音乐
      this.musicControl(true, msg)
      // 取消订阅
      // 点击一次会产生一个订阅所以要即使取消订阅
      PubSub.unsubscribe('musicId');
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // option 可以拿到query参数
    this.setData({
      musicId:options.musicId
    })
    this.getSongDetail()
    
    // 判断当前页面音乐是否在播放
    if(appInstance.globalData.isMusicPlay && appInstance.globalData.musicId === this.data.musicId){
      // 修改当前页面音乐播放状态为true
      this.setData({
        isPlay: true
      })
    }

    // 创建控制音乐播放的实例
    this.backgroundAudioManager = wx.getBackgroundAudioManager();
    // 监视音乐播放/暂停/停止
    // 因为音乐是可以后台播放的
    this.backgroundAudioManager.onPlay(() => {
      this.changePlayState(true);
      // 修改全局音乐播放的状态
      appInstance.globalData.musicId = this.data.musicId;
    });
    this.backgroundAudioManager.onPause(() => {
      this.changePlayState(false);
    });
    this.backgroundAudioManager.onStop(() => {
      this.changePlayState(false);
    });
    this.backgroundAudioManager.onTimeUpdate(() => {
      if(appInstance.globalData.musicId !== this.data.musicId){
        return
      }
      this.setData({
        currentTime:moment(this.backgroundAudioManager.currentTime*1000).format('mm:ss'),
        currentWidth:(this.backgroundAudioManager.currentTime)/(this.backgroundAudioManager.duration)*450
      })
    })
    this.backgroundAudioManager.onEnded(()=>{
      PubSub.publish('switchType','next')
      // 将实时进度条的长度还原成 0；时间还原成 0；
      this.setData({
        currentWidth: 0,
        currentTime: '00:00'
      })
    })
  },

  // 控制音乐播放/暂停的功能函数
  async musicControl(isPlay, musicId, musicLink){
    
    if(isPlay){ // 音乐播放
      if(!musicLink){
        // 获取音乐播放链接
        let musicLinkData = await request('/song/url', {id: musicId});
        musicLink = musicLinkData.data[0].url;
        
        this.setData({
          musicLink
        })
      }
      
      this.backgroundAudioManager.src = musicLink;
      this.backgroundAudioManager.title = this.data.songDetail[0].al.name
    }else { // 暂停音乐
      this.backgroundAudioManager.pause();
    }
    
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