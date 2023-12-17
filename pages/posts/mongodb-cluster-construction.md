---
title: mongodb集群搭建
date: 2023-01-24
duration: 10min
---

最近开发遇到一个问题，也就是工作中后端会常常遇到的一个问题，如何保证事务的**原子性**。由于涉及到许多操作，例如用 docker 搭建 mongo 集群、mongo 配置，特此记录一下。

### Atomicity 原子性

> 保证事务中所有要执行的操作**要么同时成功**，**要么同时失败**，即使其中一个操作出现问题，其他的上下操作都不会执行成功。

例如，订单提交的时候，如果消费者使用了优惠券，我们会开启一个事物来执行两部操作：

- 优惠券数量减 1
- 提交订单

**如果优惠券减 1 操作失败了会直接抛出错误，而不会提交订单**。以下是一个简单事例

```js
router.get("/test", async (req, res) => {
  let session = await mongoose.startSession();
  session.startTransaction();
  try {
    await user.findByIdAndUpdate(
      req.userId,
      {
        coupon: {
          num: {
            $inc: -1,
          },
        },
      },
      {
        session,
      }
    );
    await order.findByIdAndUpdate(
      req.body._id,
      { status: "SUCCESS" },
      { session }
    );
    await session.commitTransaction();
    res.sendStatus(200);
  } catch (error) {
    res.status(500).send(error);
  } finally {
    session.endSession();
  }
});
```

### Question

如果上面的代码开启事务就会报下面这个**bug**

> Transaction numbers are only allowed on a replica set member or mongos

这个问题是说 mongo 的事务只允许在**集群**上开启
有两种解决方案：

- 全局安装 npm 模块`run-rs`，这个模块会帮你搭建一个 mongo 集群，**只能用于测试**
- 在你所在的环境中搭建**mongo 集群**

由于我要用于生产，我肯定不能选用第一种，但是元宝我又是穷鬼，怎么可能买这么多服务器来搭建集群，虚拟机的话 mac m1 不兼容，于是用了 docker 来搭建

### Replica Set

中文翻译叫做**副本集**，mongo 中的集群也叫副本集，其实简单来说就是集群当中包含了多份数据，保证主节点挂掉了，备节点能继续提供数据服务，提供的前提就是数据需要和主节点一致。

![](/images/2c9b3489-4978-425f-a7a6-d8196aac5802.webp)
Mongodb(M)表示主节点，Mongodb(S)表示备节点，Mongodb(A)表示仲裁节点。主备节点存储数据，仲裁节点不存储数据。客户端同时连接主节点与备节点，不连接仲裁节点。

### 搭建集群

1. 创建一个三个节点，对应三个文件夹

```sh
#三个目录分别对应主，备，仲裁节点
mkdir -p /mongodb/master/db
mkdir -p /mongodb/slaver/db
mkdir -p /mongodb/arbiter/db
```

2. 创建日志文件

```sh
touch /mongodb/master/mongo.log
touch /mongodb/slaver/mongo.log
touch /mongodb/arbiter/mongo.log
```

3. 创建配置文件

```sh
touch /mongodb/master/mongo.conf
touch /mongodb/slaver/mongo.conf
touch /mongodb/arbiter/mongo.conf
```

4. 编辑配置文件

```sh
systemLog:
# 日志存放
  destination: file
  path: /data/mongo.log
  logAppend: true
storage:
# 数据存放地址
  dbPath: /data/db
  directoryPerDB: true
net:
# 主27017 从27018 仲27019，三个配置文件修改成对应的端口号
  port: 27017
  bindIp: 0.0.0.0
replication:
# 副本集的名字，三个节点必须保持一致
  replSetName: rs0
  enableMajorityReadConcern: true
```

5. 编写 docker-compose.yaml 文件

```yaml
version: "3"

services:
  master:
    container_name: master
    image: mongo
    command: mongod -f /etc/mongo.conf
    ports:
      - 27017:27017
    volumes:
      - ./master/db:/data/db
      - ./master/mongo.log:/data/mongo.log
      - ./master/mongo.conf:/etc/mongo.conf
  slaver:
    container_name: slaver
    image: mongo
    command: mongod -f /etc/mongo.conf
    ports:
      - 27018:27018
    volumes:
      - ./slaver/db:/data/db
      - ./slaver/mongo.log:/data/mongo.log
      - ./slaver/mongo.conf:/etc/mongo.conf
  arbiter:
    container_name: arbiter
    image: mongo
    command: mongod -f /etc/mongo.conf
    ports:
      - 27019:27019
    volumes:
      - ./arbiter/db:/data/db
      - ./arbiter/mongo.log:/data/mongo.log
      - ./arbiter/mongo.conf:/etc/mongo.conf
```

6. 一键启动集群`docker-compose up -d`
7. 进入主节点容器`docker exec -it 主节点容器ID /bin/bash`
8. 在主节点的 mongosh 中进行集群的初始化

```sh
rs.initiate({
  _id:'rs0',
  members:[
    {
      _id:0,
      ## 容器内访问其他容器必须使用容器名称
      host:'master:27017',
      ## 优先级
      priority:2
    },{
      _id:1,
      host:'slaver:27018',
      priority:1
    },{
      _id:2,
      host:'arbiter:27019',
      ## 仲裁节点必须设置为true
      arbiterOnly:true
    }
  ]
})
```

显示这样就说明成功了![](/images/eb836e5d-98e1-4213-9cc4-4d4792e8fe7b.webp)

9. 查看集群状态`rs.status()`

![](/images/a6595a14-57b0-4f5e-97f3-6f8840f889a8.webp)

10. 测试副本集数据是否会同步

- 随便插入一条数据`db.test.insert({name:'lby'})`
- 查询`db.test.find()`

![](/images/7963f08c-d576-410f-8626-c6f872248dc8.webp)
切换从节点的容器查看，不过要先执行`rs.secondaryOk()`,因为从节点默认是**不提供查询服务的**，只提供数据的备份以及主节点挂掉之后从节点能晋升为主节点。

![](/images/21926d6e-9a59-4c5c-b56b-a372d13eb57f.webp)
