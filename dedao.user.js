// ==UserScript==
// @name         得到web+ v0.9
// @namespace    http://tampermonkey.net/
// @version      0.9
// @description  在页面中添加一个左侧悬浮菜单
// @author       https://github.com/chwstudio
// @match        https://www.dedao.cn/course/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const MAX_SCROLL_COUNT = 20; // 最大滚动次数

    // 插入样式，优化菜单设计与动画效果
    const style = document.createElement('style');
    style.textContent = `
/* 悬浮菜单默认状态：左侧固定，40x40小图标，半透明 */
.floating-menu {
  position: fixed;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 40px;
  height: 40px;
  background-color: rgba(255,107,0,0.3);
  border-top-right-radius: 8px;
  border-bottom-right-radius: 8px;
  overflow: hidden;
  transition: width 0.3s ease, height 0.3s ease, box-shadow 0.3s ease, background-color 0.3s ease;
  box-shadow: 2px 2px 5px rgba(0,0,0,0.3);
  z-index: 10000;
  cursor: pointer;
}

/* 鼠标悬停后菜单扩展 */
.floating-menu:hover {
  width: 220px;
  height: auto;
  background-color: #ff6b00;
  box-shadow: 4px 4px 10px rgba(0,0,0,0.4);
}

/* 菜单头部：默认居中显示图标 */
.floating-menu .menu-header {
  padding: 0;
  height: 40px;
  line-height: 40px;
  text-align: center;
  color: #fff;
  font-size: 24px;
  font-weight: bold;
  user-select: none;
}

/* 悬停状态下，头部左对齐并增加内边距 */
.floating-menu:hover .menu-header {
  padding: 10px;
  font-size: 20px;
  text-align: left;
  border-bottom: 1px solid rgba(255,255,255,0.3);
}

/* 菜单内容：默认隐藏，悬停后渐显 */
.floating-menu .menu-content {
  opacity: 0;
  transition: opacity 0.3s ease;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 10px;
}
.floating-menu:hover .menu-content {
  opacity: 1;
}

/* 菜单中按钮样式 */
.floating-menu button {
  background-color: #ffffff;
  color: #ff6b00;
  border: none;
  border-radius: 5px;
  padding: 8px 12px;
  font-size: 14px;
  cursor: pointer;
  text-align: left;
  transition: background-color 0.3s, transform 0.2s;
}
.floating-menu button:hover {
  background-color: #ffe6d5;
  transform: scale(1.05);
}
    `;
    document.head.appendChild(style);

    // 创建悬浮菜单（默认仅显示小图标）
    const menu = document.createElement('div');
    menu.className = 'floating-menu';

    // 菜单头部：默认显示小图标（这里用“≡”表示）
    const header = document.createElement('div');
    header.className = 'menu-header';
    header.textContent = '≡';
    menu.appendChild(header);

    // 菜单内容区域（包含两个按钮）
    const content = document.createElement('div');
    content.className = 'menu-content';

    // “定位到底部”按钮
    const btnBottom = document.createElement('button');
    btnBottom.textContent = '定位到底部';
    btnBottom.addEventListener('click', () => {
        const container = document.querySelector('.ps.ps--active-y');
        if (container) {
            let scrollCount = 0;
            function autoScroll() {
                const previousHeight = container.scrollHeight;
                container.scrollTop = container.scrollHeight;
                setTimeout(() => {
                    if (container.scrollHeight > previousHeight && scrollCount < MAX_SCROLL_COUNT) {
                        scrollCount++;
                        autoScroll();
                    }
                }, 500);
            }
            autoScroll();
        }
    });

    // “定位到progress”按钮
    const btnProgress = document.createElement('button');
    btnProgress.textContent = '定位到上次学习';
    // 定义自动滚动寻找 progress 的函数
    function autoScrollToProgress(count) {
        const container = document.querySelector('.ps.ps--active-y');
        if (!container) return;
        const target = container.querySelector('.progress-info.subscribe-progress');
        if (target) {
            let offset = 0;
            let cur = target;
            while (cur && cur !== container) {
                offset += cur.offsetTop;
                cur = cur.offsetParent;
            }
            container.scrollTop = offset - container.clientHeight / 2 + target.clientHeight / 2;
            target.style.transition = 'background-color 0.5s';
            target.style.backgroundColor = 'red';
            setTimeout(() => {
                target.style.backgroundColor = '';
            }, 1000);
        } else {
            if (count < MAX_SCROLL_COUNT) {
                // 没找到则滚动到底部以加载新内容
                const previousHeight = container.scrollHeight;
                container.scrollTop = container.scrollHeight;
                setTimeout(() => {
                    autoScrollToProgress(count + 1);
                }, 500);
            } else {
                console.warn('达到最大滚动次数，请再次点击以继续查找');
            }
        }
    }
    btnProgress.addEventListener('click', () => {
        autoScrollToProgress(0);
    });

    content.appendChild(btnBottom);
    content.appendChild(btnProgress);
    menu.appendChild(content);

    // 将悬浮菜单添加到页面
    document.body.appendChild(menu);
})();
