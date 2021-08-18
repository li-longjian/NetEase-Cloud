import request from '../../utils/request'

// pages/login/login.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    phone:'',
    password: "",
    isLogin:true
  },
/**
 * 
 * 处理收集表单内容 
 */
  hanldinput(event){
   
    const type = event.currentTarget.id;
    this.setData({
      [type] : event.detail.value
    })

  },
  /**
   * 
   *
   */
 async login(){
    let {phone,password,isLogin} = this.data;

    //前端验证表单格式 
    if(!phone){
      wx.showToast({
        title:'手机号不能为空',
        icon: "none"
      })
      return;
    }
    let phoneres = /^1[3-9]\d{9}$/
    if(!(phoneres.test(phone))){
      wx.showToast({
        title:'手机号格式错误',
        icon: "none"
      })
      return;
    }
    if(!password){
      wx.showToast({
        title:'密码不能为空',
        icon: "none"
      })
      return;
    }
    //后端验证
    await request('/login/cellphone',{phone,password,isLogin}).then(res=>{
      if(res.code === 200){
        wx.showToast({
          title:'登录成功',
          icon: "success"
        });
        //缓存用户信息
        wx.setStorageSync('userInfo',res.profile);
        //跳转到个人中心页
        wx.switchTab({
          url:'/pages/profile/profile'
        })


      }else if(res.code === 400){
        wx.showToast({
          title:'手机号错误',
          icon: "none"
        })
      }else if(res.code === 502){
        wx.showToast({
          title:'密码错误',
          icon: "none"
        })
      }else {
        wx.showToast({
          title:'登录失败,请稍后',
          icon: "none"
        })
      }
    })

  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})