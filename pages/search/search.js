import request from '../../utils/request'
let isSend = false
Page({

  /**
   * 页面的初始数据
   */
  data: {
    placeholder:'',
    HotSearchList:[],
    searchInputValue:'',
    SearchRusult:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getsearchdefaultplaceholder()
    this.getHotSongSearchList()
  },
// 获取搜索框默认数据
async getsearchdefaultplaceholder(){
  await request ('/search/default').then(res =>{
    this.setData({
      placeholder:res.data.showKeyword
    })
  }).catch(err =>{
    console.log(err)
  })
},
/**获取热搜列表 */
async getHotSongSearchList(){
  await request('/search/hot/detail').then(res =>{
    
    this.setData({
      HotSearchList : res.data
    })
  })
},
/**处理搜索框 */
handleInput(event){
  this.setData({
    searchInputValue : event.detail.value
  })
  if(isSend){
    return ;
  }
  this.getSearchRusult()
  isSend = true
  this.Throttling()
},
/**获取模糊查询的结果 */
async getSearchRusult(){
  if(!this.data.searchInputValue){
    this.setData({
      SearchRusult : []
    })
    return ;
  }
  await request('/search',{keywords:this.data.searchInputValue,limit:10}).then(res =>{
    this.setData({
      SearchRusult : res.result.songs
    })
  })
  
},
/**节流函数 */
Throttling(){
  setTimeout(() => {
    isSend = false
  }, 300);
},
/** */
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