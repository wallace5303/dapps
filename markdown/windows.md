&nbsp;
### 系统要求

支持 64 位版本的 Windows 10 Pro，且必须开启 Hyper-V。

&nbsp;
### 安装

下载： [百度云](https://pan.baidu.com/s/1ktkQmkn7yE00lj3XY_qN2w) 或 [官方地址](https://download.docker.com/win/stable/Docker%20Desktop%20Installer.exe)


&nbsp;
### 运行

在 Windows 搜索栏输入 Docker 点击 Docker for Windows 开始运行。

![](http://img02.shangguantv.com/pic/install-win-docker-app-search.png)

Docker CE 启动之后会在 Windows 任务栏出现鲸鱼图标。

![](http://img02.shangguantv.com/pic/install-win-taskbar-circle.png)

等待片刻，点击 Got it 开始使用 Docker CE。

![](http://img02.shangguantv.com/pic/install-win-success-popup-cloud.png)

&nbsp;
### windows用户请打开docker的磁盘共享
- 右击“docker desktop is runing”，就是电脑右下角的一个docker图标
- 点击“settings”
- 再点击“shared Drives”
- 然后把磁盘都勾上，就可以了

### 下载加速

在任务栏托盘 Docker 图标内右键菜单选择 `Settings`，
1. 新版本

    打开配置窗口后在左侧导航菜单选择 `daemon`，如图：
    ![](https://i.loli.net/2019/10/19/SIvyHez6OE7Wshw.png)

2. 老版本

    打开配置窗口后在左侧导航菜单选择 `Docker Engine`，在右侧像下边一样编辑 json 文件，之后点击 `Apply & Restart` 保存后 Docker 就会重启并应用配置的镜像地址了。

    ```json
    {
        "registry-mirrors": [
            "https://reg-mirror.qiniu.com",
            "https://dockerhub.azk8s.cn"
        ]
    }
    ```
