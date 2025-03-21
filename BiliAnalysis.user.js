// ==UserScript==
// @name         BiliBili本地解析(Miro)
// @namespace    https://bbs.tampermonkey.net.cn/
// @version      0.1.9
// @description  try to take over the world!
// @author       Miro 鸭鸭 github.com/mmyo456/BiliAnalysis
// @match        https://www.bilibili.com/video*
// @match        https://www.bilibili.com/*bvid*
// @downloadURL  https://raw.githubusercontent.com/mmyo456/BiliAnalysis/main/BiliAnalysis.user.js
// @updateURL    https://raw.githubusercontent.com/mmyo456/BiliAnalysis/main/BiliAnalysis.user.js
// @grant        GM_xmlhttpRequest
// @grant        GM_addStyle
// @require      https://lf26-cdn-tos.bytecdntp.com/cdn/expire-1-M/jquery/3.2.1/jquery.min.js
// ==/UserScript==
//20240521 移除多余按钮
//20230405 修复解析1080p(需已登陆)
//20230626 修复加载慢导致无法添加按钮
//20230811 添加左上角和右下角解析按钮 加快按钮出现速度
//20241029 重写了新的解析成功告知方式
//20241031 小修小补

(function () {
  'use strict';

  // 添加提示框的样式
  GM_addStyle(`
      #notificationBox {
          position: fixed;
          bottom: -100px; /* 初始位置在视口之外 */
          left: 50%;
          transform: translateX(-50%);
          width: 300px;
          padding: 20px;
          background-color: #333;
          color: #fff;
          text-align: center;
          border-radius: 10px;
          box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.3);
          opacity: 0;
          transition: all 0.5s ease;
          z-index: 9999;
      }
      #notificationBox.show {
          bottom: 20px; /* 提示框弹出位置 */
          opacity: 1;
      }
  `);

  // 创建提示框元素
  const notificationBox = document.createElement('div');
  notificationBox.id = 'notificationBox';
  notificationBox.innerHTML = `
      <img src="https://testingcf.jsdelivr.net/gh/mmyo456/BiliAnalysis@main/img/DLC122.gif" alt="图片" style="width: 50px; height: 50px;">
      <h3>解析成功</h3>
      <p>链接已复制到剪贴板</p>
  `;
  document.body.appendChild(notificationBox);

  // 创建右下角解析按钮
  var BiliAnalysisbutton = `<button id="BiliAnalysis" style="z-index:999;width: 45px;height:45px;color: rgb(255, 255, 255); background: rgb(0, 174, 236); border: 1px solid rgb(241, 242, 243); border-radius: 6px; font-size: 14px;top:800px;right:0px;position:fixed;">本地</br>解析</button>`;
  $("body").append(BiliAnalysisbutton);
  document.getElementById('BiliAnalysis').addEventListener('click', clickBotton);

  // 创建左上角解析按钮
  var BiliAnalysisbutton1 = `<button id="BiliAnalysis1" style="z-index:999;width: 45px;height:45px;color: rgb(255, 255, 255); background: rgb(0, 174, 236); border: 1px solid rgb(241, 242, 243); border-radius: 6px; font-size: 14px;top:100px;left:0px;position:fixed;">本地</br>解析</button>`;
  $("body").append(BiliAnalysisbutton1);
  document.getElementById('BiliAnalysis1').addEventListener('click', clickBotton);

  // 按钮点击事件
  function clickBotton() {
    var url = window.location.href;
    var BV = /(?=BV).*?(?=\?|\/)/;
    var P = /(?<=p=).*?(?=&vd)/;
    var BV1 = url.match(BV);
    var P1 = url.match(P);

    if (BV1 == null) {
      BV1 = url.match(/(?<=bvid=).*?(?=&)/);
    }

    if (P1 == null) {
      P1 = 1;
    }

    // 获取cid
    var httpRequest = new XMLHttpRequest();
    httpRequest.open('GET', 'https://api.bilibili.com/x/player/pagelist?bvid=' + BV1, true);
    httpRequest.send();
    httpRequest.onreadystatechange = function () {
      if (httpRequest.readyState == 4 && httpRequest.status == 200) {
        var json = JSON.parse(httpRequest.responseText);
        var cid = json.data[P1 - 1].cid;
        console.log(json.data[P1 - 1].cid);

        // 获取视频链接
        var httpRequest1 = new XMLHttpRequest();
        httpRequest1.open('GET', 'https://api.bilibili.com/x/player/playurl?bvid=' + BV1 + '&cid=' + cid + '&qn=116&type=&otype=json&platform=html5&high_quality=1', true);
        httpRequest1.withCredentials = true;
        httpRequest1.send();
        httpRequest1.onreadystatechange = function () {
          if (httpRequest1.readyState == 4 && httpRequest1.status == 200) {
            var json = JSON.parse(httpRequest1.responseText);
            navigator.clipboard.writeText(json.data.durl[0].url).catch(e => console.error(e));
            console.log(json.data.durl[0].url);

            // 显示弹出提示框
            notificationBox.classList.add('show');
            // 设置定时器，在10秒后自动隐藏提示框
            setTimeout(() => {
              notificationBox.classList.remove('show');
            }, 10000);
          }
        };
      }
    };
  }
})();
