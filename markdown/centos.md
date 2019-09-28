&nbsp;
#### 安装

```bash
$ curl -fsSL get.docker.com -o get-docker.sh
$ sudo sh get-docker.sh --mirror Aliyun
```

#### 启动 Docker CE

```bash
$ sudo systemctl enable docker
$ sudo systemctl start docker
```

### 安装docker-compose（注意：**版本>=1.23**）

```
$ sudo curl -L https://github.com/docker/compose/releases/download/1.23.2/docker-compose-`uname -s`-`uname -m` > /usr/local/bin/docker-compose
$ sudo chmod +x /usr/local/bin/docker-compose
```