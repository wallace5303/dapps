&nbsp;
### Ubuntu 16.04+、Debian 8+、CentOS 7

对于使用 [systemd](https://www.freedesktop.org/wiki/Software/systemd/) 的系统，请在 `/etc/docker/daemon.json` 中写入如下内容（如果文件不存在请新建该文件）

```json
{
  "registry-mirrors": [
    "https://reg-mirror.qiniu.com"
    "https://dockerhub.azk8s.cn"
  ]
}
```

> 注意，一定要保证该文件符合 json 规范，否则 Docker 将不能启动。

之后重新启动服务。

```bash
$ sudo systemctl daemon-reload
$ sudo systemctl restart docker
```

>注意：如果您之前查看旧教程，修改了 `docker.service` 文件内容，请去掉您添加的内容（`--registry-mirror=https://dockerhub.azk8s.cn`）。

&nbsp;
### Windows 10

对于使用 `Windows 10` 的用户，在任务栏托盘 Docker 图标内右键菜单选择 `Settings`，打开配置窗口后在左侧导航菜单选择 `Docker Engine`，在右侧像下边一样编辑 json 文件，之后点击 `Apply & Restart` 保存后 Docker 就会重启并应用配置的镜像地址了。

```json
{
  "registry-mirrors": [
    "https://dockerhub.azk8s.cn",
    "https://reg-mirror.qiniu.com"
  ]
}
```

&nbsp;
### macOS

对于使用 macOS 的用户，在任务栏点击 Docker Desktop 应用图标 -> `Perferences`，在左侧导航菜单选择 `Docker Engine`，在右侧像下边一样编辑 json 文件。修改完成之后，点击 `Apply & Restart` 按钮，Docker 就会重启并应用配置的镜像地址了。

```json
{
  "registry-mirrors": [
    "https://dockerhub.azk8s.cn",
    "https://reg-mirror.qiniu.com"
  ]
}
```

&nbsp;
### 检查加速器是否生效

执行 `$ docker info`，如果从结果中看到了如下内容，说明配置成功。

```bash
Registry Mirrors:
 https://dockerhub.azk8s.cn/
```

&nbsp;
### gcr.io 镜像

国内无法直接获取 `gcr.io/*` 镜像，我们可以将 `gcr.io/<repo-name>/<image-name>:<version>` 替换为 `gcr.azk8s.cn/<repo-name>/<image-name>:<version>` ,例如

```bash
# $ docker pull gcr.io/google_containers/hyperkube-amd64:v1.9.2

$ docker pull gcr.azk8s.cn/google_containers/hyperkube-amd64:v1.9.2
```
