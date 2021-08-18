import request from '../../utils/request'
import PubSub from 'pubsub-js'
import moment from 'moment'
// 创建app实例
var appInstance = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isPlay:false,
    songDetail:{},
    ids:0,
    radioUrl:'',
    currentPregressTime:'00:00',//开始时间
    destinationProgressTime:'00:00',//终点时间
    currentWidth:0,//播放进度条位置
    cushioningTime:'0'//缓冲时间
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    /**根据ids请求歌曲详情 */
    //ids是由路由路径query中传进来的参数
    const ids = options.ids
    this.setData({
      ids
    })

//根据全局记录的musicid判断当前歌曲是否正在后台播放，并及时修改isPlay的状态
    if(appInstance.globalData.MusicId === ids && appInstance.globalData.isMusicPlay){
      this.setData({
        isPlay:true
      })
    }


    this.getSongdetails(ids)
    this.getRadioUrl(ids)

//将 backgroundAudioManager实例 放 this 里面其他地方也可以使用
    this.backgroundAudioManager = wx.getBackgroundAudioManager()
    // 监听后台和页面的音乐播放与暂停

    //监听到播放
    this.backgroundAudioManager.onPlay(()=>{
      this.changeIsPlay(true)
      appInstance.globalData.MusicId = ids
    })
    //监听暂停
    this.backgroundAudioManager.onPause(()=>{
      this.changeIsPlay(false)
    })
    //监听离开页面时音乐应该停止
    this.backgroundAudioManager.onStop(()=>{
      this.changeIsPlay(false)
    })
//监听歌曲自动播放到结尾时
    this.backgroundAudioManager.onEnded(()=>{
      // this.changeIsPlay(false)
      //并且把进度条时间清除
    this.setData({
       currentPregressTime:'00"00',
       currentWidth:0
     })
     PubSub.publish('willSwitchSong', "next")

    })
    //监听歌曲播放的进度时间
    this.backgroundAudioManager.onTimeUpdate(()=>{
      console.log(this.backgroundAudioManager.buffered)
      const cushioningTime = this.backgroundAudioManager.buffered
      const currentTime = moment(this.backgroundAudioManager.currentTime  * 1000).format('mm:ss')
      const currentWidth = (this.backgroundAudioManager.currentTime/this.backgroundAudioManager.duration) *530
      this.setData({
        currentPregressTime:currentTime,
        currentWidth,
        cushioningTime
      })
    })
    // 监听歌曲缓存
    this.backgroundAudioManager.onWaiting(()=>{
      wx.showLoading({
        title: '缓存中',
      })
    })
    //可以播放时隐藏onLoading
    this.backgroundAudioManager.onCanplay(()=>{
      wx.hideLoading()
    })
  },
  /**改变isPlay的值  并且修改全局中音乐播放的状态*/
  changeIsPlay(isPlay){
    this.setData({
      isPlay: isPlay,
      

    })
   appInstance.globalData.isMusicPlay = isPlay
  },
  /**根据ids请求歌曲详情 */
  async getSongdetails(ids){
    await request('/song/detail',{ids:ids}).then(res =>{
      let destinationProgressTime = moment(res.songs[0].dt).format("mm:ss")
      this.setData({
        songDetail:res.songs[0],
        destinationProgressTime
      })
    })
    
  },
 

  /**根据歌曲详情id获取到歌曲资源地址 */
  async getRadioUrl(ids){
    await request('/song/url',{id:ids}).then( res =>{
      this.setData({
        radioUrl:res.data[0].url
      })
    }
    )
    // 若没有获取到音乐资源则不存在版权
    if(this.data.radioUrl === null){
      wx.showToast({
        title: '音乐暂无版权',
        icon:'none'
      })
      this.setData({
        isPlay:false
      })
      
    }
  },
  /**
   * 监听页面点击的播放和暂停：出现的问题，系统后台的播放与暂停无法监听
   * 解决方法：同时监听播放与暂停  ： 使用backgroundAudioManager.onPlay()监听播放
   * backgroundAudioManager.onPause()监听暂停
   */
  MusicPlay(){
    let isPlay = this.data.isPlay
    this.setData({
      isPlay: !isPlay
    })
    wx.hideLoading()
    if(this.data.radioUrl === null){
      wx.showToast({
        title: '音乐暂无版权',
        icon:'none'
      })
      this.setData({
        isPlay:false
      })
     
    }

   
    this.controlMusicPlay()
   

  },
  /**
   * 控制音乐播放与暂停
   */
  controlMusicPlay(){
   const {isPlay,radioUrl,songDetail} = this.data
   if(isPlay){
    //  播放音乐
    this.backgroundAudioManager.src = radioUrl
    this.backgroundAudioManager.title = songDetail.name
    
   }else{
    //  暂停音乐
   this.backgroundAudioManager.pause()
   
   }
  },


/**处理歌曲切换 */
switchSong(event){

  const type = event.currentTarget.id

  // 切歌之前先把当前音乐停止
  this.backgroundAudioManager.stop()
  wx.hideLoading()
  //把进度条清零
  this.setData({
    currentPregressTime:'00"00',
    currentWidth:0
  })
 //监听回传的micId
 PubSub.subscribe('micId',(msg,micId)=>{
    
  this.getRadioUrl(micId)
  this.getSongdetails(micId)
  this.setData({
    isPlay:true
  })
  this.controlMusicPlay()
        //需要取消订阅
 PubSub.unsubscribe('micId')
    
    } )
       
 
    // 触发事件，发布消息传递参数给推荐歌单
   PubSub.publish('willSwitchSong', type)
   
 
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