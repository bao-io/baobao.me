---
title: 使用Cloudflare的Tunnel进行反向代理
date: 2023-12-21
duration: 6min
tocAlwaysOn: true
category:
  - Linux
  - Cloudflare
---

[[toc]]

> 你还在为买不起价格**昂贵的服务器**、**没有公网IP**的问题而**烦恼**吗？阅读本文带你无需服务器即可让你在**公网访问你的应用程序**。

之前也发过一篇文章吐槽过使用`Ngrok`进行反向代理，因为其免费的代理域名对国区**速率有限制**，所以那会就推荐大家使用一款名为`frp`的开源软件进行反向代理。但是今天我发现了一种更好的反向代理方式，就是使用`Cloudflare`的**Tunnel**功能进行反向代理。

## 优缺点

使用这种方式的优点：

- 完全免费
- 拥有完整的GUI界面，操作简易
- **无需暴露您的真实IP**
- 无需要配置Nginx等任何反向代理软件
- 无需配置SSL证书
- 提供免费的SSL证书

缺点：你的域名DNS必须由Cloudflare进行**托管**（其实缺点也是优点，因为Cloudflare是全球最大的网站防御机构，由它进行托管的网站，可以省去不少的麻烦。）

## 原理

Cloudflare的Tunnel原理就是在你本地安装他所需要的依赖，然后本地安装它所提供的JWT令牌，在GUI界面上进行**IP端口与域名地址的映射**即可实现内网穿透的能力。说白了就是可以通过你自己的域名访问你的应用程序。

## 要求

1. 拥有Cloudflare账号
2. 拥有一个属于自己的域名
3. 域名的DNS需由Cloudflare进行托管

## Steps

1. 登录Cloudflare（没有的话自己注册），选择你托管的域名

![](/images/a93c0c7d9f14fe220cb5a1c51ad766a0.png) 2. 点击Access，然后创建Zero Trust

![](/images/2986974c05cd4566ae6d07cc7da24908.png)

3. 创建完成后，你会进入到如下页面，接着我们点击Access菜单中的Tunnels，然后创建Tunnel

![](/images/8a4c304eecfe98c5dc7dae4e8985e926.png)

4. 输入tunnel的名称，然后继续

5. 根据自己所属的机型选择对应的安装方式，这里以`Mac`为例

```bash
# 安装cloudflared依赖
brew install cloudflare/cloudflare/cloudflared
# 本地安装服务所需的JWT令牌
sudo cloudflared service install eyJ.....
```

![](/images/2c7057259f07d6ebbecee63efd927d97.png)

6. 安装成功之后在GUI界面中便会出现成功连接的客户端，然后点击下一步

![](/images/512aba6b73ea3a3d0586270e47f2d284.png)

![](/images/0d2b5222b8d799e1ab93dcff3a74b122.png)

7. 按照下图根据自己的情况进行应用程序的IP端口号与域名之间进行绑定，然后点击保存

![](/images/a06a3d8879001594c68ad1be1dadba76.png)

8. 最后在浏览器中输入你绑定的域名，测试是否能通过https协议访问你的本地服务

![](/images/20d1202a2f608585e54dd79314d37b6d.png)

![](/images/95a3cba634597b96c9a7b29c41c5b996.png)

9. 完结撒花🎉

## 感悟

有如此好用的功能，我突然想起是时候好好的利用我那台32G运存的Mac Stutio了，把一些在我服务器上资源消耗大的docker、jenkins等服务都通过本地化进行部署，然后通过cloudflare进行内网穿透，直接起飞！！！

![](/images/dc6c358583f70ab06d9efc57dfa97a98.png)
