// pages/yuncun/yuncun.js
import request from '../../utils/request'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    navDataList:[],
    currentId:0,
    videoDataList:[],
    videoId:0,
    timeUpdate:[],
    isRefresh:false,
    cookie:''
  },
  getcookie(){
    let res = wx.getStorageSync('cookies')?wx.getStorageSync('cookies').find(item => {
     return item.indexOf('MUSIC_U') !== -1
   }):'';
   this.setData({
     cookie:res
   })
  },
  changeIndex(event){
   this.setData({
     currentId:event.currentTarget.dataset.id,
     videoDataList:[],
    
   })
   this.getVideoList(this.data.currentId)
   wx.showLoading({
     title:'加载中'
   })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getvideoCategroy()
    this.getcookie()
  },

  /**获取视频分类标签 */
  async getvideoCategroy(){
    await request('/video/group/list').then(res =>{
      this.setData({
        navDataList:res.data.slice(0,14),
        currentId:res.data[0].id
      })
      this.getVideoList(this.data.currentId)
    })
  },
  /**
   * 
   * 根据列表标签Id获取新视频数据
   */
   async getVideoList(videoId){
     await request('/video/group',{id:videoId}).then(res =>{
      
        this.setData({
          videoDataList: res.datas,
          isRefresh:false

        })
     })
     wx.hideLoading();
    
   },
   /**下拉刷新函数 */
   pullingRefresh(){
     this.getVideoList(this.data.currentId)
   },
   /**上拉触底加载更多 */
   loadMore(){
     let {videoDataList} = this.data
     let newVideoList =[] 
     let page =1 ;
     request('/video/group',{id:this.data.currentId , offset:page}).then(res =>{
      newVideoList = res.datas
      videoDataList.push(...newVideoList)
      this.setData({
        videoDataList
      })
      page++;
     })
   },
   /**处理播放和暂停 */
   hanldPlay(event){
    const vid = event.currentTarget.id
    /**进行性能优化，当点击当前视频，则播放对应vid的视频，否则则为图片 */
    this.setData({
      videoId:vid
    })
    let {timeUpdate} = this.data
     const item = timeUpdate.find(item =>{
       return item.vid === vid
     })
     this.VideoContext =  wx.createVideoContext(vid)
     if(item){
      this.VideoContext.seek(item.currentTime)
     }
    
    // 因为使用图片代替视频，已经不用考虑这个问题了
    // /**2.当vid不同且不是第一个视频时停止上一个播放的视频 */
    //  this.vid !== vid && this.videoContent && this.videoContent.stop()

    //  /**
    //   * 1.把上一个视频的vid和createVideoContext实例保存到this中
    //   */
    // this.vid = vid
    // 
   },
   //视频到结尾时
   handended(event){
      let {timeUpdate} = this.data
     timeUpdate = timeUpdate.splice(timeUpdate.findIndex(item => item.vid === event.currentTarget.id),1)
     this.setData({
      timeUpdate
     })
   },
   /**
    * 处理播放返回上一个视频播放的位置
    */
   hanldtimeUpdate(event){
     
      let videoObj = {  vid: event.currentTarget.id, currenttime: event.detail.currentTime }

      const {timeUpdate} = this.data
     let videoItem = timeUpdate.find(item =>{
        return item.vid === videoObj.vid
      })
      if(videoItem){
        videoItem.currenttime = event.detail.currentTime
      }else{
        timeUpdate.push(videoObj)
      }
      
      this.setData({
        timeUpdate
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