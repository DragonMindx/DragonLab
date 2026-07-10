---
title: 学习笔记 HTTP/SSH
date: 2026-07-10
categories: CS
tags:
  - Web
---
	#### 今天学习HTTP和SSH，因为在捣鼓Git。这两个都是网络协议

Git进行控制时分为两套

HTTP/HTTPS：走网页协议

SSH：走安全远程登录协议

所以

* * *

HTTP：（HyperText Transfer Protocol)

规定客户端对服务器的请求格式，以及服务器的返回包格式

HTTP本身是明文的，而HTTPS是HTTP+TLS加密的。因此现在很多网站使用HTTPS

原始的HTTP为了查询数据库需要UserName和PassWord的串，后来Git取消了密码，采用Access Token，即长期授权凭证

在每次Push时，Git使用凭证和服务器交接验证，通过后即可登录。

* * *

SSH：（Secure Shell）

最早用于远程登录Linux，可以在用户端与服务器之间建立一条加密通信

后来Git采用此协议，得到这样的格式

git@github.com:user/project.git

表示：用户名@服务器:仓库

SSH有两种认证。第一种是UserName和PassWord串，和HTTP相近

第二种也是更普遍的是使用公钥

由客户端生成公钥-私钥对，然后将公钥上传GitHub或者其他平台配置保存，每次需要验证时，服务器会要求配对钥组，验证通过则可登录