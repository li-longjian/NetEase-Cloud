import request from '../../utils/request'
import PubSub from 'pubsub-js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    day:'',
    month:'',
    RecommendSong:[],
    index:0  //歌曲在歌曲列表里的下标值

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    /**推荐歌曲数据需要用户登录后才能查看 */
    const userInfo = wx.getStorageSync('userInfo')
    if(!userInfo){
      wx.showToast({
        title: '请先登录',
        icon:'none',
        success:()=>{
          wx.reLaunch({
            url: '/pages/login/login',
          })
        }
      })

    }

    /**更新时间 */
    this.getdate()
    /**获取每日推荐数据 */
    this.getRecommendSong()

// 定义事件，当切换歌曲时订阅来自歌曲详情
    PubSub.subscribe('willSwitchSong',(msg,type)=>{
      
      let {index,RecommendSong} = this.data
        if(type === 'pre'){
          if(index === 0){
            index = RecommendSong.length
          }
         index -= 1
        }
        if(type === 'next'){
          if(index === (RecommendSong.length-1)){
            index = -1
          }
          index += 1
        }
        this.setData({
          index,
        })
        let micId = RecommendSong[index].id
          
        //将音乐id重新回传给音乐详情页
        PubSub.publish('micId',micId)
        // wx.navigateTo({
        //   url:"/pages/songDetail/songDetail?ids=" + micId
        // })
    })

  },
  /**得到当前日期函数 */
  getdate(){
    let date = new Date()
    let day = date.getDate()
    let month = date.getMonth()+1
    if(day<10){
      day = '0' + day
    }
    if(month<10){
    month = '0' + month
    }
    this.setData({
      day,
      month
    })
  },
/**获取每日推荐歌曲列表 */
async getRecommendSong(){
  await request('/recommend/songs').then(res =>{
      this.setData({
        RecommendSong: res.recommend
      })
  })
},

/**点击图片/歌曲时跳转播放详情 */
toMusicdetail(event){
  let songId = event.currentTarget.dataset.micid

  // 存储当前播放歌曲在歌曲列表中的下标
  let index = event.currentTarget.dataset.index
  this.setData({
    index,
  })

  // 跳转到歌曲详情
  wx.navigateTo({
    url:"/pages/songDetail/songDetail?ids=" + songId
  })


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