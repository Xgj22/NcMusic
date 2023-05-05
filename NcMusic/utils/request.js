// 发送 AJAX　请求
import config from "./config"
// 封装功能函数

export default (url,data={},method='GET') =>{
    return new Promise((resolve,reject) =>{
        wx.request({
            url : config.host + url,
            data,
            method,
            // 由于接口问题,本地无法读取到cookie,因此采用将cookie写死的方式获取数据
            // 正常流程应该是获取res数据后,wx.setStorage(res.cookie),然后将cookie添加到请求头发送数据(用wx.getStorageSync获取)
            // 如果用户没有登录则cookie为空
            header: {
                "cookie": "NMTID=00OdxL555N5EpD_pkdGuc6rVV4KzIgAAAGAN6OOjQ; __remember_me=true; MUSIC_U=ed0cb6e29d653f3ec0e21c0dc41f79ec2dd230d27baabe6aabfe6d72374932c0519e07624a9f00539298497389169ffe896cf17deaa24dd13d51aa9d9b957811fecc66c942829a91d4dbf082a8813684;  __csrf=111"
            },
            success:(res)=>{
                if(url=='/captcha/verify'){
                    console.log(res)
                }
                
                resolve(res.data)
            },
            fail:(err)=>{
                // console.log(err)
                reject(err)
            }
        })
    })
    
}