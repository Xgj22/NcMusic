// pages/login/login.js
import request from "../../utils/request.js"

Page({

  /**
   * 页面的初始数据
   */
  data: {
    phone:'',
    password:'',
    captcha:''
  },

  handlerInput(event){
    // event 获取文本框
    this.setData({
      [event.target.id] :event.detail.value
    })
  },

  // async getQrkey(){
  //   let qrKey = await request('/top/playlist/highquality',{limit:10},'get')
  //   console.log(qrKey)
  // },

  async sendCaptcha(){
    if(!this.data.phone){
      wx.showToast({
        title:"手机号不能为空",
        icon:'none'
      })
      return
    }
    let phoneReg = /^1(3|4|5|6|7|8|9)\d{9}$/
    // test 正则校验
    if(!phoneReg.test(this.data.phone)){
      wx.showToast({
        title:"手机号格式错误",
        icon:'none'
      })
      return
    }
    let loginResult = await request('/captcha/sent',{phone:this.data.phone})
    if(loginResult){
      wx.showToast({
        title:"验证码发送成功",
        icon:'success'
      })
      return
    }
  },
  
  async handlerLogin(){
    
    if(!this.data.captcha){
      wx.showToast({
        title:"验证码不能为空",
        icon:'none'
      })
      return
    }
    let successLogin = await request('/captcha/verify',{phone:this.data.phone,captcha:this.data.captcha})
    if(successLogin.code==200){
      let userInfo = {
        avatarUrl: "http://p2.music.126.net/18Cqm04e_IelKuDC9PZ4VQ==/109951168469065215.jpg",
        nickname: "_x2222x_",
        userId: 8449958433,
        userType:2
      }
      wx.setStorageSync('userInfo',JSON.stringify(userInfo))
      wx.reLaunch({
        url:"/pages/personal/personal"
      })
    }else{
      wx.showToast({
        title:"登陆失败，请重新登录",
        icon:'none'
      })
      return
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

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