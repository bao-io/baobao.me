---
title: 搭建代理服务器
date: 2023-07-16
duration: 10min
category:
  - JavaScript
  - Nginx
---

## 手动搭建代理服务器

今天分享的是如何利用几行脚本代码亲手搭建代理服务器直接国内代理国外的任何接口。比如 openai、midjourney 等等。

> 首先本地或者服务器必要要有 vpn 服务

## 编写

代码是用`js`脚本、使用`express`框架搭建，其他语言原理都一样。

```js
// ./index.js
const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const { HttpsProxyAgent } = require("https-proxy-agent");
const server = express();
const router = express.Router();

const createProxy = (path, target) => [
  path,
  createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite: { [`^/proxy${path}`]: "" },
    agent: new HttpsProxyAgent("http://localhost:7890"),
  }),
];

router.use(...createProxy("/openai", "https://api.openai.com"));
router.use(...createProxy("/xxxxx", "https://xxxxx"));

server.use("/proxy", router);

server.listen(9000, () => {
  console.log(`http proxy service run on http://localhost:9000`);
});
```

## 运行

```bash
node index.js
```

这样我们本地直接运行 [http://localhost:9000/proxy/openai](http://localhost:9000/proxy/openai) 即可在无 vpn 的环境下调用 openai 的接口啦～

## 部署

项目用的是`pm2`进行 node 项目部署管理

```bash
pm2 start ecosystem.config.js
```

如果用到了 nginx 部署的话，就要考虑到 openai 是流式进行返回消息。所以要在代理的地址上新增如下配置才能生效：

```nginx
location /proxy {
  proxy_pass http://localhost:9002/proxy;
  proxy_http_version 1.1;
  proxy_set_header Connection '';
  chunked_transfer_encoding off;
  proxy_buffering off;
  proxy_cache off;
  proxy_redirect off;
  proxy_set_header Host $host;
  proxy_set_header X-Real-IP $remote_addr;
  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  proxy_set_header Upgrade $http_upgrade;
  proxy_set_header Connection "upgrade";
  proxy_set_header Cookie $http_cookie;
  proxy_read_timeout 86400s;
  proxy_send_timeout 86400s;
}

```

具体可以参考我的代码仓库：[https://github.com/LaiBaoYuan/server-api-proxy](https://github.com/LaiBaoYuan/server-api-proxy)
