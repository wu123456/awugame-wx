//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    ballCount : 1,
    ballConfigs : [],
    userInfo: {},
    animationData: {}, 
    animationDatas : [],
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  //事件处理函数
  bindViewTap: function(e) {
    console.log(e)
  },
  initBalls: function(){
    for (let i = 0; i < this.data.ballCount; i++){
      // 
      this.data.ballConfigs.push({
        x : 0,
        y : 0,
        duration : 900,
        length : 60
      })
    }
    this.setData({
      ballConfigs: this.data.ballConfigs
    })
  },

  ballStart: function(){
    return setTimeout(function(){
      let animation = wx.createAnimation({
        timingFunction: 'linear',
        delay: 0
      })

      // animation.translate(200, 50).step({ duration: 10000 })
      // animation.translate(300, 300).step({ duration: 1000 })

      this.reflex({ x: 0, y: 0 }, { x:200, y: 750 }, 0, 10000, 0, 0, animation)

      this.data.animationDatas[0] = animation.export()
      this.setData({
        animationDatas: this.data.animationDatas
      })
    }.bind(this),1000)
    
    for (let index in this.data.ballConfigs){
      let ball = this.data.ballConfigs[index]
      let animation = wx.createAnimation({
        timingFunction: 'linear',
        delay: 0
      })
      
      setInterval(function () {

        let start = { x: ball.x, y: ball.y }

        ball.x += (Math.random() - 0.5) * ball.length
        ball.y += (Math.random() - 0.5) * ball.length

        let end = {x : ball.x, y: ball.y}

        end = this.reflex(start, end, 0, ball.duration, 0, 0, animation)
        ball.x = end.x
        ball.y = end.y
        this.data.animationDatas[index] = animation.export()
        this.setData({
          animationDatas: this.data.animationDatas
        })
      }.bind(this), ball.duration)
    }
    
  },
  
  //叉积 
  mult: function(a, b, c) {  
    return(a.x-c.x)*(b.y-c.y)-(b.x - c.x) * (a.y - c.y);  
  },  

  //aa, bb为一条线段两端点 cc, dd为另一条线段的两端点 相交返回true, 不相交返回false  
  intersect: function(aa, bb, cc, dd) {  
    let max = Math.max;
    let min = Math.min;
    if(max(aa.x, bb.x) <= min(cc.x, dd.x)) {
      return false;
    }  
    if (max(aa.y, bb.y) <= min(cc.y, dd.y)) {
      return false;
    }  
    if (max(cc.x, dd.x) <= min(aa.x, bb.x)) {
      return false;
    }  
    if (max(cc.y, dd.y) <= min(aa.y, bb.y)) {
      return false;
    }  
    if (this.mult(cc, bb, aa) * this.mult(bb, dd, aa) <= 0) {
      return false;
    }  
    if (this.mult(aa, dd, cc) * this.mult(dd, bb, cc) <= 0) {
      return false;
    }  
    return true;  
  },

  reflex: function (start, end, radius, duration, dotStart, dotEnd, animation){
    console.log(start, end, duration)
    dotStart = {x: 0, y: 0}
    dotEnd = {x: 100, y: 100}
    let dot2 = { x: dotStart.x, y: dotEnd.y }
    let dot3 = { x: dotEnd.x, y: dotStart.y }

    if (this.intersect(start, end, dotStart, dot2)) {
    // if(end.x  < dotStart.x){
      let ratio = (start.x - dotStart.x) / (start.x - end.x);
      let y = (end.y - start.y) * ratio + start.y;
      
      let durationFirst = ratio * duration;
      animation.translate(dotStart.x, y).step({ duration: durationFirst });
      return (this.reflex({
          x: dotStart.x,
          y: y
        }, {
          x: 2 * dotStart.x - end.x,
          y: end.y
        }, radius, duration - durationFirst, dotStart, dotEnd, animation ))
    }

    // if (end.x > dotEnd.x) {
    if (this.intersect(start, end, dot3, dotEnd)) {
      let ratio = (start.x - dotEnd.x) / (start.x - end.x);
      let y = (end.y - start.y) * ratio + start.y;
      let durationFirst = ratio * duration;
      animation.translate(dotEnd.x, y).step({ duration: durationFirst });
      return (this.reflex({
        x: dotEnd.x,
        y: y
      }, {
          x: 2 * dotEnd.x - end.x,
          y: end.y
        }, radius, duration - durationFirst, dotStart, dotEnd, animation))
    }

    if (this.intersect(start, end, dotStart, dot3)) {
    // if (end.y < dotStart.y) {
      let ratio = (start.y - dotStart.y) / (start.y - end.y);
      let x = (end.x - start.x) * ratio + start.x;
      let durationFirst = ratio * duration;
      animation.translate(x, dotStart.y).step({ duration: durationFirst });
      return (this.reflex({
        x: x,
        y: dotStart.y
      }, {
          x: end.x,
          y: 2 * dotStart.y - end.y
        }, radius, duration - durationFirst, dotStart, dotEnd, animation))
    }

    if (this.intersect(start, end, dot2, dotEnd)) {
    // if (end.y >  dotEnd.y) {
      let ratio = (start.y - dotEnd.y) / (start.y - end.y);
      let x = (end.x - start.x) * ratio + start.x;
      let durationFirst = ratio * duration;
      animation.translate(x, dotEnd.y).step({ duration: durationFirst });
      return (this.reflex({
        x: x,
        y: dotEnd.y
      }, {
          x: end.x,
          y: 2 * dotEnd.y - end.y
        }, radius, duration - durationFirst, dotStart, dotEnd, animation))
    }

    animation.translate(end.x, end.y).step({ duration: duration });
    return end;
  },


  onLoad: function () {
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse){
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }

    var animation = wx.createAnimation({
      timingFunction: 'linear',
      delay: 0
    })

    var x =0 , y = 0
    wx.onAccelerometerChange(function (res) {
      x += res.x * 100
      y += res.y * -100
      animation.translate(x, y).step({ duration: 3000 })
      this.setData({
        animationData: animation.export()
      })
    }.bind(this))

    this.initBalls()
    this.ballStart()
  },
  getUserInfo: function(e) {
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  }
})

