import config from './config'


export default (url,data={},method="GET")=>{
 return new Promise((resolve,reject)=>{
    wx.request({
      url: config.host + url,
    // url: config.out_host + url,
    data,
    header:{
      cookie: wx.getStorageSync('cookies')?wx.getStorageSync('cookies').find(item => {
        return item.indexOf('MUSIC_U') !== -1
      }):''
    },
    success:(res) =>{
      //判断是否为登录请求，若是，则保存cookies
      if(data.isLogin){
        wx.setStorage({
          key:"cookies",
          data:res.cookies
        })
      }
      resolve(res.data)
    },
    fail:(err)=>{
      reject(err)
    }

  })
 })
}