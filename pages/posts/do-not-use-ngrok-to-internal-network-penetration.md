---
title: 别再用垃圾ngrok进行内网穿透了
date: 2023-01-16
---

最近在接触微信小程序支付的功能，然后要接收微信服务器发来的支付回调，所以微信后台要设置消息推送的配置，结果让我看到了这个很难受的提示
![](/images/4084992a-bb1e-4648-81c0-d56b6bb2c852.webp)
什么！！！一个月只能修改`三次`，我靠(因为我使用的内网穿透工具每次重新启动`地址都会变更`，每次变更都要修改，所以根本不切实际)这里先科普一下什么是`内网穿透`

### 内网穿透

现在由于 ipv4 的地址已经殆尽....，所以什么 xxx 设计出了内网 ip 来解决 ipv4 地址不够的问题，也就是平时我们看到的`10.0.xxx`、`172.16.xxx`、`192.168.xxx`这类地址，但是内网我们是不能直接通过外网访问，只有在同一局域网内的设备能相互访问，于是就诞生了`Nat技术(Network Address Translation网络地址转换)`，我们通过这个技术实现`内外网互通`，就是这么的哇塞～～～

### 内网穿透工具

现在市面上的内网穿透工具要么是国外开源的`ngrok`（网速慢的要死\)，要么就是国内的`cpolar`(网速不错，但是每次重新启动的地址都是随机生成的，要想配置自定义域名必须给 money💰，况且还很贵)，程序员的我除了服务器费用之外怎么可能会自己掏钱呢？？？于是找了很多解决方案，还果真有解决方案———`frp`

### frp 代理访问

> 前提条件：一台**公网 ip**的服务器

1. github 访问这个仓库`fatedier/frp`
2. 在 relase 中找到自己系统架构的源码文件，本地和服务器都要进行下载(也可以本地下载好上传至服务器)

![](/images/2732dad8-95a6-49c7-a4cf-0749cc4f9a43.webp)

3. 解压下载的源码可以看到文件夹内有两个配置文件`frpc.ini`和`frps.ini`,带`c`后缀的是客户端配置文件，带`s`后缀的是服务器配置

![](/images/7309b374-4bca-454c-82e1-19cf668c8190.webp)

4. 在服务器上打开`frps.ini`，修改配置如下

```
[common]
# frps服务器端口，防火墙要打开
bind_port = 7000
# 验证客户端连接
token = 1234567820222022ccc
```

5. 服务器启动`./frps -c ./frps.ini`
6. 本地打开`frpc.ini`，配置如下

```
[common]
#  服务器公网 ip
server_addr = xxxx.xxxx.xxxx.xxxx
#  服务器 frps 端口
server_port = 7000
#  服务器要验证客户端的 token
token = 1234567820222022ccc

[ssh]
type = tcp
local_ip = 127.0.0.1
#  本地服务端口
local_port = 9000
#  通过服务器访问本地服务的端口，防火墙要开
remote_port = 7001
#  自定义域名
# custom_domains = xxxxxx
```

7.  本地启动`./frpc -c ./frpc.ini`
8.  测试，如果有配置域名就访问`http://域名:7001`，如果没有就访问`http://服务器ip:7001`，这样就可以访问本地的服务啦