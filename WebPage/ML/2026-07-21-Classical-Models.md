---
title: 经典机器学习模型
date: 2026-07-21
categories: ML
tags:
  - LinearModel
  - Logistic
  - SVM
  - DT
mathjax: true
---

今天先补一些经典机器学习模型，因为比较简单，就不会做很多额外的深入阐释。人机感也比较重

## Linear model 线性模型（族）

形如以下的模型：

$$
f(\mathbf{x})=\mathbf{w}^{\mathsf T}\mathbf{x}+b
$$

其中的 $\mathbf{w},\mathbf{x}$ 均为向量。值得注意，对 $\mathbf{x}$ 做某种映射 $\phi(\mathbf{x})$ 得到的也是线性模型：

$$
f(\mathbf{x})=\mathbf{w}^{\mathsf T}\phi(\mathbf{x})+b
$$

这里的线性是指模型对映射后的特征是线性的，而 $\phi(\mathbf{x})$ 是根据原特征构建的新特征

线性模型主要用于回归问题，其思想直接来源于最小二乘法。

### 最小二乘法

设数据集为

$$
\mathcal{D}=\{(\mathbf{x}_i,y_i)\}_{i=1}^{n}
$$

线性回归希望寻找参数 $(\mathbf w,b)$，使估计值

$$
\hat{y}_i=\mathbf{w}^{\mathsf T}\mathbf{x}_i+b
$$

与真实值 $y_i$ 的平方误差最小，即求解
$$
\underset{\mathbf{w},b}{\arg\min}\;\sum_{i=1}^{n}\left(y_i-\mathbf{w}^{\mathsf T}\mathbf{x}_i-b\right)^2
$$

将偏置项并入参数，令

$$
\tilde{\mathbf{x}}_i= \begin{bmatrix}\mathbf{x}_i\\1\end{bmatrix}, \qquad \tilde{\mathbf{w}}= \begin{bmatrix}\mathbf{w}\\b\end{bmatrix}
$$

则

$$
\hat{y}_i=\tilde{\mathbf{w}}^{\mathsf T}\tilde{\mathbf{x}}_i
$$

将所有样本组成设计矩阵 $X$，标签组成向量 $\mathbf y$，并省略波浪号，有

$$
\hat{\mathbf{y}}=X\mathbf{w}
$$

因此最小二乘问题等价于
$$
\underset{\mathbf{w}}{\arg\min}\;\lVert\mathbf{y}-X\mathbf{w}\rVert_2^2
$$

其损失函数为
$$
\left(\mathbf{y}-X\mathbf{w}\right)^{\mathsf T}\left(\mathbf{y}-X\mathbf{w}\right)
$$

展开并求梯度：
$$
\mathbf{y}^{\mathsf T}\mathbf{y}-2\mathbf{w}^{\mathsf T}X^{\mathsf T}\mathbf{y}+\mathbf{w}^{\mathsf T}X^{\mathsf T}X\mathbf{w}
$$
$$
\nabla_{\mathbf{w}}J=-2X^{\mathsf T}\mathbf{y}+2X^{\mathsf T}X\mathbf{w}
$$

令梯度为 $0$，得到正规方程

$$
X^{\mathsf T}X\mathbf{w}=X^{\mathsf T}\mathbf{y}
$$

若 $X^{\mathsf T}X$ 可逆，则最小二乘解为
$$
\mathbf{w}^{*}=\left(X^{\mathsf T}X\right)^{-1}X^{\mathsf T}\mathbf{y}
$$
这一结果也被称为最小二乘解。

不过实际计算中一般不会真的显式计算矩阵逆，因为矩阵求逆开销较大，而且可能带来数值稳定性问题。工程中通常使用 QR 分解、SVD 或梯度下降等方式求解。

### 为什么局部最优就是全局最优

要判断损失函数的形状，可以进一步计算它关于参数 $\mathbf{w}$ 的 $Hessian$ 矩阵：
$$
\nabla_{\mathbf{w}}^2J=2X^{\mathsf T}X
$$

对于任意非零向量 $\mathbf{z}$，有：

$$
\mathbf{z}^{\mathsf T}X^{\mathsf T}X\mathbf{z}=(X\mathbf{z})^{\mathsf T}(X\mathbf{z})=\lVert X\mathbf{z}\rVert_2^2\ge 0
$$

所以 $X^{\mathsf T}X$ 是半正定矩阵，$Hessian$ 矩阵也是半正定的。

因此，最小二乘损失函数是凸函数。

对于凸优化问题，任意局部最优解都是全局最优解 $\text{Global Minimum}$
这意味着普通线性回归不存在深度神经网络中常见的复杂非凸优化问题。

如果 $X^{\mathsf T}X$ 是正定矩阵，则损失函数严格凸，最优解唯一。

如果不同特征之间存在完全线性相关，使得 $X$ 不满列秩，则 $X^{\mathsf T}X$ 可能不可逆，最优解可能不唯一。这也是特征工程要处理共线性的一个不准确但够强的解释。

### 范数与正则化

为限制参数规模，在原损失函数中加入正则项：
$$
\underset{\mathbf{w}}{\arg\min}\;\left[\lVert\mathbf{y}-X\mathbf{w}\rVert_2^2+\lambda\,\Omega(\mathbf{w})\right]
$$

其中 $\lambda\geq 0$ 为正则化强度，$\Omega(\mathbf w)$ 用于度量参数规模。

参数向量的 $L_1$ 范数与 $L_2$ 范数分别定义为
$$
\lVert\mathbf{w}\rVert_1=\sum_{j=1}^{d}|w_j|
$$
$$
\lVert\mathbf{w}\rVert_2=\sqrt{\sum_{j=1}^{d}w_j^2}
$$

正则化中通常使用平方后的 $L_2$ 范数：
$$
\lVert\mathbf{w}\rVert_2^2=\sum_{j=1}^{d}w_j^2=\mathbf{w}^{\mathsf T}\mathbf{w}
$$

通常不对偏置项 $b$ 进行正则化。


---


#### Ridge Regression 岭回归

在最小二乘损失中加入 $L_2$ 正则项：
$$
\underset{\mathbf{w}}{\arg\min}\;\left[\lVert\mathbf{y}-X\mathbf{w}\rVert_2^2+\lambda\lVert\mathbf{w}\rVert_2^2\right]
$$

即
$$
\left(\mathbf{y}-X\mathbf{w}\right)^{\mathsf T}\left(\mathbf{y}-X\mathbf{w}\right)+\lambda\mathbf{w}^{\mathsf T}\mathbf{w}
$$

对 $\mathbf w$ 求梯度：
$$
\nabla_{\mathbf{w}}J=-2X^{\mathsf T}\mathbf{y}+2X^{\mathsf T}X\mathbf{w}+2\lambda\mathbf{w}
$$

令梯度为 $0$：
$$
\left(X^{\mathsf T}X+\lambda I\right)\mathbf{w}=X^{\mathsf T}\mathbf{y}
$$

因此
$$
\mathbf{w}^{*}=\left(X^{\mathsf T}X+\lambda I\right)^{-1}X^{\mathsf T}\mathbf{y}
$$

$L_2$ 正则化使各参数整体收缩，但通常不会使参数严格变为 $0$。同时，$\lambda I$ 可以改善 $X^{\mathsf T}X$ 的条件数，缓解多重共线性带来的参数不稳定。


---


#### Lasso Regression

在最小二乘损失中加入 $L_1$ 正则项：
$$
\underset{\mathbf{w}}{\arg\min}\;\left[\lVert\mathbf{y}-X\mathbf{w}\rVert_2^2+\lambda\lVert\mathbf{w}\rVert_1\right]
$$

即
$$
\lVert\mathbf{y}-X\mathbf{w}\rVert_2^2+\lambda\sum_{j=1}^{d}|w_j|
$$

$L_1$ 正则化倾向于使部分参数严格变为 $0$：

$$
w_j=0 \quad\Longrightarrow\quad \text{第 }j\text{ 个特征不参与预测}
$$

因此 Lasso 可以得到稀疏参数，并隐式完成特征选择。

由于 $|w_j|$ 在 $w_j=0$ 处不可导，Lasso 一般不存在与 Ridge 相同形式的解析解，通常使用坐标下降法或近端梯度法求解。


---


#### Elastic Net 弹性网络

同时加入 $L_1$ 与 $L_2$ 正则项：
$$
\underset{\mathbf{w}}{\arg\min}\;\left[\lVert\mathbf{y}-X\mathbf{w}\rVert_2^2+\lambda_1\lVert\mathbf{w}\rVert_1+\lambda_2\lVert\mathbf{w}\rVert_2^2\right]
$$

也可写为
$$
\underset{\mathbf{w}}{\arg\min}\;\left[\lVert\mathbf{y}-X\mathbf{w}\rVert_2^2+\lambda\left(\alpha\lVert\mathbf{w}\rVert_1+(1-\alpha)\lVert\mathbf{w}\rVert_2^2\right)\right]
$$

其中

$$
0\leq\alpha\leq1
$$

当

$$
\alpha=1
$$

时退化为 Lasso；当

$$
\alpha=0
$$

时退化为 Ridge。

Elastic Net 同时具有 $L_1$ 正则化的稀疏性与 $L_2$ 正则化的稳定性，适合特征数量较多且特征之间存在相关性的情况。


---


三种模型可以统一表示为

- **Ridge**

$$
\lVert\mathbf{y}-X\mathbf{w}\rVert_2^2+\lambda\lVert\mathbf{w}\rVert_2^2
$$

- **Lasso**

$$
\lVert\mathbf{y}-X\mathbf{w}\rVert_2^2+\lambda\lVert\mathbf{w}\rVert_1
$$

- **Elastic Net**

$$
\lVert\mathbf{y}-X\mathbf{w}\rVert_2^2+\lambda_1\lVert\mathbf{w}\rVert_1+\lambda_2\lVert\mathbf{w}\rVert_2^2
$$

其中 Ridge 主要实现参数收缩，Lasso 主要产生稀疏解，Elastic Net 则兼顾二者。

## Logistic Regression 逻辑回归

线性回归输出

$$
z=\mathbf{w}^{\mathsf T}\mathbf{x}+b\in\mathbb{R}
$$

不能直接表示二分类概率。逻辑回归假设类别的对数几率与特征呈线性关系：

$$
\log\frac{p(y=1\mid\mathbf{x})}{p(y=0\mid\mathbf{x})}=\mathbf{w}^{\mathsf T}\mathbf{x}+b
$$

记 $z=\mathbf{w}^{\mathsf T}\mathbf{x}+b$，解得
$$
p(y=1\mid\mathbf{x})=\sigma(z)=\frac{1}{1+e^{-z}},\qquad p(y=0\mid\mathbf{x})=1-\sigma(z)
$$

将偏置并入参数：

$$
\mathbf{x}\leftarrow\begin{bmatrix}\mathbf{x}\\1\end{bmatrix},\qquad \mathbf{w}\leftarrow\begin{bmatrix}\mathbf{w}\\b\end{bmatrix}
$$

则

$$
\hat{y}_i=p(y_i=1\mid\mathbf{x}_i;\mathbf{w})=\sigma\!\left(\mathbf{w}^{\mathsf T}\mathbf{x}_i\right)
$$

#### Bernoulli 概率模型

给定数据集

$$
\mathcal{D}=\{(\mathbf{x}_i,y_i)\}_{i=1}^{n},\qquad y_i\in\{0,1\}
$$

单个样本的条件概率可以统一写成

$$
p(y_i\mid\mathbf{x}_i;\mathbf{w})=\hat{y}_i^{y_i}(1-\hat{y}_i)^{1-y_i}
$$

假设样本独立同分布，似然函数为

$$
\mathcal{L}(\mathbf{w})=p(\mathcal{D}\mid\mathbf{w})=\prod_{i=1}^{n}\hat{y}_i^{y_i}(1-\hat{y}_i)^{1-y_i}
$$

取对数：

$$
\ell(\mathbf w)=\sum_{i=1}^{n} \left[ y_i\log\hat y_i + (1-y_i)\log(1-\hat y_i) \right]
$$

最大化对数似然等价于最小化负对数似然，即二元交叉熵：

$$
J(\mathbf{w})=-\frac{1}{n}\sum_{i=1}^{n}\left[y_i\log\hat{y}_i+(1-y_i)\log(1-\hat{y}_i)\right]
$$

其中

$$
\hat y_i=\sigma(\mathbf w^{\mathsf T}\mathbf x_i)
$$

因此 Logistic Regression 可以理解为：

$$
\text{线性打分}\longrightarrow\text{Sigmoid 概率映射}\longrightarrow\text{Bernoulli MLE}
$$

#### 梯度与优化

Sigmoid 的导数为

$$
\sigma'(z)=\sigma(z)(1-\sigma(z))
$$

交叉熵损失对参数的梯度可化简为

$$
\nabla_{\mathbf{w}}J=\frac{1}{n}\sum_{i=1}^{n}(\hat{y}_i-y_i)\mathbf{x}_i=\frac{1}{n}X^{\mathsf T}(\hat{\mathbf{y}}-\mathbf{y})
$$

因此可使用梯度下降：

$$
\mathbf{w}^{(t+1)}=\mathbf{w}^{(t)}-\eta\frac{1}{n}X^{\mathsf T}(\hat{\mathbf{y}}-\mathbf{y})
$$

令

$$
D=\operatorname{diag}\!\left(\hat{y}_1(1-\hat{y}_1),\ldots,\hat{y}_n(1-\hat{y}_n)\right)
$$

则 Hessian 为

$$
\nabla_{\mathbf{w}}^2J=\frac{1}{n}X^{\mathsf T}DX
$$

对于任意向量 $\mathbf v$：

$$
\mathbf{v}^{\mathsf T}\nabla_{\mathbf{w}}^2J\mathbf{v}=\frac{1}{n}(X\mathbf{v})^{\mathsf T}D(X\mathbf{v})\ge 0
$$

所以

$$
\nabla_{\mathbf w}^{2}J\succeq0
$$

即 Logistic Regression 的交叉熵损失关于 $\mathbf w$ 为凸函数，局部最优即全局最优。若 $X$ 满列秩，则通常为严格凸函数，有限最优解唯一。

#### 分类规则与决策边界

预测概率为

$$
\hat y=\sigma(\mathbf w^{\mathsf T}\mathbf x+b)
$$

给定阈值 $\tau$，分类规则为

$$
\hat c= \begin{cases} 1,&\hat y\geq\tau\\ 0,&\hat y<\tau \end{cases}
$$

当 $\tau=0.5$ 时，由 $\sigma(0)=0.5$，决策边界满足

$$
\mathbf w^{\mathsf T}\mathbf x+b=0
$$

因此 Logistic Regression 虽然使用了非线性的 Sigmoid，但其决策边界仍然是线性的。

#### 正则化 Logistic Regression

加入 $L_2$ 正则项：

$$
J_{L_2}(\mathbf{w})=-\frac{1}{n}\sum_{i=1}^{n}\left[y_i\log\hat{y}_i+(1-y_i)\log(1-\hat{y}_i)\right]+\lambda\lVert\mathbf{w}\rVert_2^2
$$

梯度为

$$
\nabla_{\mathbf{w}}J_{L_2}=\frac{1}{n}X^{\mathsf T}(\hat{\mathbf{y}}-\mathbf{y})+2\lambda\mathbf{w}
$$

加入 $L_1$ 正则项：
$$
J_{L_1}(\mathbf{w})=-\frac{1}{n}\sum_{i=1}^{n}\left[y_i\log\hat{y}_i+(1-y_i)\log(1-\hat{y}_i)\right]+\lambda\lVert\mathbf{w}\rVert_1
$$

$L_2$ 正则用于收缩参数、提高稳定性；$L_1$ 正则可产生稀疏权重并进行特征选择。通常不对偏置项 $b$ 正则化。


---

## Support Vector Machine 支持向量机

给定二分类数据集

$$
\mathcal{D}=\{(\mathbf{x}_i,y_i)\}_{i=1}^{n},\qquad \mathbf{x}_i\in\mathbb{R}^d,\quad y_i\in\{-1,+1\}
$$

线性分类器的决策超平面为

$$
\mathbf w^{\mathsf T}\mathbf x+b=0
$$

预测函数为

$$
f(\mathbf x)=\operatorname{sign} \left( \mathbf w^{\mathsf T}\mathbf x+b \right)
$$

SVM 在所有能够正确分类训练数据的超平面中，寻找**几何间隔最大**的一个。

样本 $\mathbf x_i$ 到超平面的带符号距离为

$$
\gamma_i=\frac{y_i(\mathbf{w}^{\mathsf T}\mathbf{x}_i+b)}{\lVert\mathbf{w}\rVert_2}
$$

由于同时缩放 $(\mathbf w,b)$ 不改变超平面，可将函数间隔归一化为

$$
y_i(\mathbf{w}^{\mathsf T}\mathbf{x}_i+b)\ge 1
$$

此时两侧间隔边界分别为

$$
\mathbf{w}^{\mathsf T}\mathbf{x}+b=1,\qquad \mathbf{w}^{\mathsf T}\mathbf{x}+b=-1
$$

间隔宽度为

$$
\frac{2}{\lVert\mathbf{w}\rVert_2}
$$

因此最大化间隔等价于最小化 $\lVert\mathbf{w}\rVert_2^2$。

### Hard-Margin SVM 硬间隔

当数据线性可分时，SVM 的原始问题为

目标函数为

$$
\min_{\mathbf{w},b}\frac{1}{2}\lVert\mathbf{w}\rVert_2^2
$$

约束条件为

$$
y_i(\mathbf{w}^{\mathsf T}\mathbf{x}_i+b)\ge 1,\qquad i=1,\ldots,n
$$

这是一个凸二次规划问题，因此局部最优即全局最优。

满足

$$
y_i(\mathbf{w}^{\mathsf T}\mathbf{x}_i+b)=1
$$

的样本位于间隔边界上，称为**支持向量**。最终超平面主要由这些距离分类边界最近的样本决定。


---


### Soft-Margin SVM 软间隔

真实数据通常不能完全线性可分，因此引入松弛变量 $\xi_i\geq0$：

$$
y_i(\mathbf{w}^{\mathsf T}\mathbf{x}_i+b)\ge 1-\xi_i
$$

软间隔 SVM 求解

目标函数为

$$
\min_{\mathbf{w},b,\boldsymbol{\xi}}\left(\frac{1}{2}\lVert\mathbf{w}\rVert_2^2+C\sum_{i=1}^{n}\xi_i\right)
$$

约束条件为

$$
y_i(\mathbf{w}^{\mathsf T}\mathbf{x}_i+b)\ge 1-\xi_i,\qquad \xi_i\ge 0,\qquad i=1,\ldots,n
$$

其中 $C>0$ 控制间隔宽度与分类错误之间的权衡：

$$
C\uparrow \Rightarrow \text{更强调训练集分类正确，间隔较窄}
$$

$$
C\downarrow \Rightarrow \text{允许更多违例，间隔较宽}
$$

消去松弛变量，可写成正则化经验风险形式：

$$
\min_{\mathbf{w},b}\;\frac{1}{2}\lVert\mathbf{w}\rVert_2^2+C\sum_{i=1}^{n}\max\left(0,1-y_i(\mathbf{w}^{\mathsf T}\mathbf{x}_i+b)\right)
$$

其中

$$
L_{\mathrm{hinge}}(y,f)=\max(0,1-yf)
$$

称为 Hinge Loss。

- $yf\geq1$：分类正确且位于间隔外，损失为 $0$；

- $0<yf<1$：分类正确但进入间隔；

- $yf\leq0$：分类错误。


---


### 对偶问题与支持向量

通过拉格朗日对偶，软间隔 SVM 可转化为

对偶目标为

$$
\max_{\boldsymbol{\alpha}}\left[\sum_{i=1}^{n}\alpha_i-\frac{1}{2}\sum_{i=1}^{n}\sum_{j=1}^{n}\alpha_i\alpha_jy_iy_j\mathbf{x}_i^{\mathsf T}\mathbf{x}_j\right]
$$

约束条件为

$$
0\le\alpha_i\le C,\qquad i=1,\ldots,n
$$

$$
\sum_{i=1}^{n}\alpha_i y_i=0
$$

最优参数满足

$$
\mathbf{w}^{*}=\sum_{i=1}^{n}\alpha_i^{*}y_i\mathbf{x}_i
$$

因此决策函数为

$$
f(\mathbf{x})=\operatorname{sign}\!\left(\sum_{i=1}^{n}\alpha_i^{*}y_i\mathbf{x}_i^{\mathsf T}\mathbf{x}+b^{*}\right)
$$

只有满足

$$
\alpha_i^*>0
$$

的样本会参与最终预测，这些样本就是支持向量。

这解释了 SVM 的稀疏性：

$$
\text{全部训练样本}\longrightarrow\text{少量支持向量决定分类边界}
$$


---


### Kernel Trick 核技巧

对偶问题中，样本只通过内积

$$
\mathbf x_i^{\mathsf T}\mathbf x_j
$$

出现。因此可以使用核函数

$$
K(\mathbf{x}_i,\mathbf{x}_j)=\phi(\mathbf{x}_i)^{\mathsf T}\phi(\mathbf{x}_j)
$$

直接计算高维特征空间中的内积，而不显式构造映射 $\phi(\mathbf x)$。

核 SVM 的决策函数为

$$
f(\mathbf{x})=\operatorname{sign}\!\left(\sum_{i=1}^{n}\alpha_i^{*}y_iK(\mathbf{x}_i,\mathbf{x})+b^{*}\right)
$$

常用核函数包括：

线性核：

$$
K(\mathbf x,\mathbf z)=\mathbf x^{\mathsf T}\mathbf z
$$

多项式核：

$$
K(\mathbf x,\mathbf z)=(\gamma\mathbf x^{\mathsf T}\mathbf z+r)^d
$$

RBF 高斯核：

$$
K(\mathbf{x},\mathbf{z})=\exp\!\left(-\gamma\lVert\mathbf{x}-\mathbf{z}\rVert_2^2\right)
$$

对于 RBF 核：

$$
\gamma\uparrow \Rightarrow \text{单个样本影响范围缩小，边界更复杂}
$$

$$
\gamma\downarrow \Rightarrow \text{单个样本影响范围扩大，边界更平滑}
$$

因此，$C$ 主要控制对训练误差的容忍程度，$\gamma$ 主要控制非线性边界的局部复杂度。


---


## Decision Tree 决策树

**决策树**是通过递归地将特征空间划分为矩形区域、在每个区域内拟合单一预测值来进行分类或回归的非参数模型。广泛应用于风控建模、医疗诊断、推荐系统等场景，且是 GBDT / XGBoost / Random Forest 的基学习器

决策树通过递归划分特征空间，将输入空间划分为若干互斥区域 $R_1,\dots,R_M$，并在每个区域内使用常数 $c_m$ 进行预测：
$$
f(\mathbf x)=\sum_{m=1}^{M} c_m\mathbf 1(\mathbf x\in R_m)
$$

分类树中，$c_m$ 通常为区域 $R_m$ 中的多数类别；回归树中，$c_m$ 通常为区域内标签均值

决策树训练的核心是在每个节点选择一个划分，使划分后的样本纯度尽可能高。设当前节点的数据集为 $\mathcal D$，候选划分将其分为 $\mathcal D_1,\dots,\mathcal D_V$，则不纯度下降为
$$
\operatorname{Gain}(\mathcal{D},A)=I(\mathcal{D})-\sum_{v=1}^{V}\frac{|\mathcal{D}_v|}{|\mathcal{D}|}I(\mathcal{D}_v)
$$

选择增益最大的划分：
$$
A^{*}=\underset{A}{\arg\max}\;\operatorname{Gain}(\mathcal{D},A)
$$

其中 $I(\mathcal D)$ 是节点不纯度，不同决策树算法主要区别在于不纯度的定义。

### 四种决策树算法

#### 分类树

设节点中第 $k$ 类样本比例为

$$
p_k=\frac{1}{|\mathcal{D}|}\sum_{(\mathbf{x}_i,y_i)\in\mathcal{D}}\mathbf{1}(y_i=k)
$$

##### Entropy 信息熵

节点信息熵为

$$
H(\mathcal{D})=-\sum_{k=1}^{K}p_k\log p_k
$$
当节点内所有样本属于同一类别时，$H(\mathcal D)=0$；类别分布越均匀，熵越大。

按特征 $A$ 划分后的条件熵为
$$
H(\mathcal{D}\mid A)=\sum_v\frac{|\mathcal{D}_v|}{|\mathcal{D}|}H(\mathcal{D}_v)
$$

信息增益为
$$
\operatorname{IG}(\mathcal{D},A)=H(\mathcal{D})-H(\mathcal{D}\mid A)
$$

**ID3** 选择信息增益最大的特征：
$$
A^*=\arg\max_A \operatorname{IG}(\mathcal D,A)
$$
信息增益倾向于选择取值数量较多的特征。例如，若样本编号对每个样本都唯一，则按照编号划分可以得到完全纯净的子节点，但几乎没有泛化能力。

##### Gain Ratio 信息增益率
**C4.5** 使用特征自身的分裂信息对信息增益进行归一化：

$$
\operatorname{SplitInfo}(\mathcal{D},A)=-\sum_v\frac{|\mathcal{D}_v|}{|\mathcal{D}|}\log\frac{|\mathcal{D}_v|}{|\mathcal{D}|}
$$

$$
\operatorname{GainRatio}(\mathcal{D},A)=\frac{\operatorname{IG}(\mathcal{D},A)}{\operatorname{SplitInfo}(\mathcal{D},A)}
$$
选择信息增益率较大的特征，可以减弱信息增益对多取值特征的偏好。

##### Gini Impurity 基尼不纯度

基尼不纯度定义为
$$
\operatorname{Gini}(\mathcal D)=\sum_{k=1}^{K}p_k(1-p_k)=1-\sum_{k=1}^{K}p_k^2
$$

当节点内所有样本属于同一类别时，
$$
\operatorname{Gini}(\mathcal D)=0
$$
按特征 $A$ 划分后的加权基尼不纯度为
$$
\operatorname{Gini}(\mathcal{D},A)=\sum_v\frac{|\mathcal{D}_v|}{|\mathcal{D}|}\operatorname{Gini}(\mathcal{D}_v)
$$

**CART 分类树**选择加权基尼不纯度最小的划分：
$$
A^{*}=\underset{A}{\arg\min}\;\operatorname{Gini}(\mathcal{D},A)
$$
等价地，也可以最大化基尼下降：
$$
A^*=\arg\max_A \left[ \operatorname{Gini}(\mathcal D) - \operatorname{Gini}(\mathcal D,A) \right]
$$

Entropy 与 Gini 的实际划分结果通常接近；Gini 不需要计算对数，计算更简单，因此 CART 通常使用 Gini

#### 回归树

对于区域 $R$，若使用常数 $c$ 进行预测，则最优预测值为区域内标签均值：
$$
c^*=\arg\min_c \sum_{\mathbf x_i\in R} (y_i-c)^2=\frac{1}{|R|} \sum_{\mathbf x_i\in R}y_i
$$

设特征 $j$ 在阈值 $s$ 处将数据划分为
$$
R_L(j,s)=\{\mathbf{x}_i\mid x_{ij}\le s\}
$$
$$
R_R(j,s)=\{\mathbf{x}_i\mid x_{ij}>s\}
$$
则 **CART 回归树**选择左右子节点平方误差和最小的划分：
$$
(j^*,s^*)=\arg\min_{j,s} \left[ \sum_{\mathbf x_i\in R_L(j,s)} (y_i-\bar y_L)^2 + \sum_{\mathbf x_i\in R_R(j,s)} (y_i-\bar y_R)^2 \right]
$$

也可以写成最大化 MSE 下降：
$$
\Delta_{\mathrm{MSE}}=\operatorname{MSE}(\mathcal{D})-\frac{|\mathcal{D}_L|}{|\mathcal{D}|}\operatorname{MSE}(\mathcal{D}_L)-\frac{|\mathcal{D}_R|}{|\mathcal{D}|}\operatorname{MSE}(\mathcal{D}_R)
$$

$$
(j^{*},s^{*})=\underset{j,s}{\arg\max}\;\Delta_{\mathrm{MSE}}
$$

因此，无论是分类树还是回归树，划分过程都可以统一为

$$
text{选择使不纯度下降最大的特征与划分点}
$$

### 连续特征的划分

对于连续特征 $x_j$，先对节点内的特征值排序：

$$
x_j^{(1)} \leq x_j^{(2)} \leq \cdots \leq x_j^{(m)}
$$
相邻特征值的中点可以作为候选阈值：

$$
s_t=\frac{x_j^{(t)}+x_j^{(t+1)}}{2}
$$

对所有特征 $j$ 和候选阈值 $s_t$ 计算划分增益，并选择最优组合：

$$
(j^{*},s^{*})=\underset{j,s}{\arg\max}\;\operatorname{Gain}(\mathcal{D},j,s)
$$

### 递归生长

决策树采用自顶向下的贪心算法：在当前节点选择局部最优划分，生成子节点，再对子节点递归执行相同过程

$$
\text{当前节点}\rightarrow\text{寻找最大增益划分}\rightarrow\text{生成子节点}\rightarrow\text{递归划分}
$$

这种方法不能保证得到全局最优树，但计算成本远低于直接搜索所有可能的树结构

### 剪枝

未经限制的决策树可以持续划分，直到叶节点只包含少量样本，因此容易过拟合

预剪枝在树生长过程中设置停止条件，例如 $max\_depth$、$min\_samples\_split$、$min\_samples\_leaf$ 或最小增益阈值

后剪枝先生成较完整的树，再通过复杂度惩罚删除收益较小的子树。CART 的代价复杂度目标为
$$
R_{\alpha}(T)=R(T)+\alpha|T|
$$

其中 $R(T)$ 为树的经验损失，$|T|$ 为叶节点数量，$\alpha$ 控制对模型复杂度的惩罚：

$$
\alpha\uparrow \Rightarrow \text{树更小，方差更低}
$$

$$
\alpha\downarrow \Rightarrow \text{树更复杂，训练误差更低}
$$

---

简单来说，就是这样

| 算法 | 划分准则 |
|---|---|
| ID3 | 最大化 Information Gain |
| C4.5 | 最大化 Gain Ratio |
| CART Classification | 最小化 Gini Impurity |
| CART Regression | 最小化 MSE |

其主要优点是：

- 能表达非线性关系与特征交互；
- 不要求特征标准化；
- 可以同时处理分类与回归；
- 预测过程和划分规则具有一定可解释性；
- 对单调变换通常不敏感，因为划分主要依赖样本顺序。

主要缺点是：

- 贪心训练不能保证全局最优；
- 单棵树方差高，对数据扰动敏感；
- 容易生成过深的树并过拟合；
- 轴对齐划分对某些斜向边界效率较低；
- 回归树不能自然外推训练标签范围之外的趋势。

基于决策树低偏差高方差的特点，后续的集成学习模型也对此做了改进。Random Forest 主要利用 Bagging 降低方差，Gradient Boosting 则通过逐步拟合残差降低偏差。于是 DT 正好是后面两大树模型家族的基模：
$$
\text{Decision Tree}\xrightarrow{\text{Bagging}}\text{Random Forest}
$$
$$
\text{Decision Tree} \xrightarrow{\text{Boosting}}\text{GBDT / XGBoost}
$$

---

## Ensemble Learning 集成学习

面对单个模型的缺点，一个很自然的思路就是训练大量的基模，然后把它们组合在一起，得到性能更稳定或更强大的整体模型。这就是集成学习的思路。常表示为

$$
F(\mathbf{x})=\operatorname{Aggregate}\!\left(f_1(\mathbf{x}),f_2(\mathbf{x}),\ldots,f_M(\mathbf{x})\right)
$$

其回归问题通常采用加权平均
$$
F(\mathbf{x})=\sum_{m=1}^{M}\alpha_m f_m(\mathbf{x})
$$
分类问题通常采用投票
$$
F(\mathbf{x})=\underset{k}{\arg\max}\;\sum_{m=1}^{M}\alpha_m\mathbf{1}\!\left(f_m(\mathbf{x})=k\right)
$$

集成学习主要分为三类：

- **Bagging**：并行训练多个基学习器，再平均或投票；
- **Boosting**：串行训练，每个模型修正之前模型的误差；
- **Stacking**：使用另一个模型学习如何组合多个模型的输出。

### Bagging

Bagging，即 Bootstrap Aggregating，通过对训练集进行多次 Bootstrap 重采样，训练多个相互独立的基学习器，并聚合预测结果。

设训练集为
$$
\mathcal D=\{(x_i,y_i)\}_{i=1}^n
$$
对第 $m$ 个基学习器进行有放回抽样：
$$
\mathcal D^{(m)} \sim \operatorname{Bootstrap}(\mathcal D), \qquad m=1,\ldots,M
$$
分别训练
$$
f_m = \mathcal A \left( \mathcal D^{(m)} \right)
$$
回归问题使用平均：
$$
\hat y = \frac{1}{M}\sum_{m=1}^M T_m(x)
$$
分类问题采用多数投票：
$$
\hat{y}=\operatorname{mode}\{T_1(\mathbf{x}),T_2(\mathbf{x}),\ldots,T_M(\mathbf{x})\}
$$
对于多个方差为 $\sigma^2$、两两相关系数约为 $\rho$ 的基学习器，其平均预测的方差近似为
$$
\operatorname{Var}\!\left(\frac{1}{M}\sum_{m=1}^{M}T_m\right)=\rho\sigma^2+\frac{1-\rho}{M}\sigma^2
$$
当基学习器的数量 $M$ 增加时，第二项逐渐减小，而第一项由学习器之间的相关性决定。因此：
$$
\text{Bagging}\longrightarrow\text{通过平均降低方差}
$$
Bagging 主要降低高方差模型的方差，对偏差的改善通常有限。决策树对训练数据扰动敏感，因此是最常用的 Bagging 基学习器

Bootstrap 抽样中，每个样本未被抽中的概率为
$$
\left(1-\frac{1}{n}\right)^n \rightarrow e^{-1} \approx0.368
$$
因此，每棵树大约有 $36.8\%$ 的训练样本未参与训练，这些样本称为 Out-of-Bag 样本，可用于估计泛化误差：
$$
\operatorname{OOBError}=\frac{1}{n}\sum_{i=1}^{n}\mathbf{1}\!\left(\hat{y}_i^{\mathrm{OOB}}\ne y_i\right)
$$
#### Random Forest 随机森林

**Random Forest** 采用 $Bagging$ 通过在同一数据集上并行训练多棵相互差异较大的树，并对结果平均，主要降低模型方差。

在 Bagging 的基础上，Random Forest 进一步构建随机特征子集，要求每个节点划分时，只从随机选取的部分特征中寻找最优划分：
$$
\mathcal F_m \subset \{1,\ldots,d\}
$$
$$
(j^{*},s^{*})=\underset{j\in\mathcal{F}_m,\,s}{\arg\max}\;\operatorname{Gain}(\mathcal{D},j,s)
$$
于是
$$
\text{Bagging}\longrightarrow\text{通过平均降低方差}
$$
$$
\text{随机特征子集}\rightarrow \text{降低树之间的相关性}
$$

Random Forest 的关键超参数主要是树数量 $n\_estimators$、每次划分考虑的特征数量 $max\_features$、树深度 $max\_depth$ 以及叶节点样本数等。


---


### Boosting 提升算法

与 **Random Forest** 通过并行训练来降低方差不同，**Boosting** 通过串行训练逐步纠正模型估计的误差，来减少单个模型的偏差。

Boosting 构造了以下的加法模型：
$$
F_M(\mathbf{x})=\sum_{m=1}^{M}\alpha_m f_m(\mathbf{x})
$$
其中第 $m$ 个基学习器会重点修正前 $m-1$ 个学习器尚未解决的误差
$$
F_m(\mathbf{x})=F_{m-1}(\mathbf{x})+\alpha_m f_m(\mathbf{x})
$$
因此其主要降低单个模型的偏差，并且可能降低方差。

Boosting 中常使用较弱的基学习器，例如深度较浅的决策树。不同 Boosting 方法的主要区别在于如何定义**当前模型尚未拟合好的部分**

#### AdaBoost

AdaBoost 通过提高错分样本的权重，使后续基学习器更加关注此前难以正确分类的样本。

设第 $m$ 轮训练前，样本权重为
$$
D_m(i), \qquad \sum_{i=1}^{n}D_m(i)=1
$$
训练分类器 $f_m$，其加权错误率为
$$
\varepsilon_m = \sum_{i=1}^{n} D_m(i) \mathbf 1 \left( f_m(\mathbf x_i)\neq y_i \right)
$$
基学习器权重为
$$
\alpha_m = \frac{1}{2} \log \frac{1-\varepsilon_m}{\varepsilon_m}
$$
更新样本权重：
$$
D_{m+1}(i) = \frac{ D_m(i) \exp \left( -\alpha_m y_i f_m(\mathbf x_i) \right) }{ Z_m }
$$
其中 $Z_m$ 为归一化因子。

若样本被正确分类，则
$$
y_i f_m(\mathbf{x}_i)>0\quad\Longrightarrow\quad D_{m+1}(i)\downarrow
$$
若样本被错误分类，则
$$
y_i f_m(\mathbf x_i)<0 \quad\Longrightarrow\quad D_{m+1}(i)\uparrow
$$
最终分类器为
$$
F(\mathbf x) = \operatorname{sign} \left( \sum_{m=1}^{M} \alpha_m f_m(\mathbf x) \right)
$$

#### **Gradient Boosting**

Gradient Boosting 将 Boosting 解释为函数空间中的梯度下降。

设当前模型为 $F_{m-1}(\mathbf x)$，总体目标为
$$
\min_F \sum_{i=1}^{n} L \left( y_i,F(\mathbf x_i) \right)
$$
在第 $m$ 轮，计算损失函数关于当前模型输出的负梯度：
$$
r_{im} = - \left[ \frac{ \partial L \left( y_i,F(\mathbf x_i) \right) }{ \partial F(\mathbf x_i) } \right]_{ F=F_{m-1} }
$$
使用基学习器拟合伪残差：
$$
f_m = \arg\min_f \sum_{i=1}^{n} \left( r_{im}-f(\mathbf x_i) \right)^2
$$
再寻找当前迭代的步长：
$$
\rho_m = \arg\min_\rho \sum_{i=1}^{n} L \left( y_i, F_{m-1}(\mathbf x_i) + \rho f_m(\mathbf x_i) \right)
$$
更新模型：
$$
F_m(\mathbf x) = F_{m-1}(\mathbf x) + \eta\rho_m f_m(\mathbf x)
$$
其中 $\eta$ 为学习率。

#### **GBDT**

当 Gradient Boosting 使用决策树作为基学习器时，得到 Gradient Boosting Decision Tree：
$$
\text{GBDT} = \text{Gradient Boosting} + \text{Decision Tree}
$$
对于平方损失
$$
L(y,F) = \frac{1}{2} (y-F)^2
$$
负梯度为
$$
-\frac{\partial L}{\partial F} = y-F
$$
此时伪残差等于真实残差：
$$
r_{im} = y_i-F_{m-1}(\mathbf x_i)
$$
因此平方损失下，GBDT 可以直观理解为不断使用新树拟合当前模型的残差：
$$
\text{Current Residual} \rightarrow \text{New Decision Tree} \rightarrow \text{Add to Current Model}
$$
最终模型为
$$
F_M(\mathbf x) = F_0(\mathbf x) + \eta \sum_{m=1}^{M} \rho_m T_m(\mathbf x)
$$
GBDT 的关键超参数包括 $n\_estimators$、$learning\_rate$、$max\_depth$ 和 $subsample$。
$$
\mathrm{learning\_rate}\downarrow\quad\Longrightarrow\quad\text{通常需要更多树，但泛化更稳定}
$$
$$
\mathrm{max\_depth}\uparrow\quad\Longrightarrow\quad\text{单棵树表达能力增强，但过拟合风险上升}
$$

---


#### XGBoost

**XGBoost** 在 GBDT 的基础上引入二阶梯度近似、显式树复杂度正则化以及一系列工程优化。

其目标函数为
$$
\operatorname{Obj}^{(t)} = \sum_{i=1}^{n} L \left( y_i, \hat y_i^{(t-1)} + f_t(\mathbf x_i) \right) + \Omega(f_t)
$$
对损失函数进行二阶 Taylor 展开：
$$
L \left( y_i, \hat y_i^{(t-1)} + f_t(\mathbf x_i) \right) \approx L \left( y_i,\hat y_i^{(t-1)} \right) + g_i f_t(\mathbf x_i) + \frac{1}{2} h_i f_t^2(\mathbf x_i)
$$
其中
$$
g_i=\frac{\partial L(y_i,\hat{y}_i)}{\partial\hat{y}_i}
$$

$$
h_i=\frac{\partial^2 L(y_i,\hat{y}_i)}{\partial\hat{y}_i^2}
$$
树复杂度正则项通常写为
$$
\Omega(f) = \gamma T + \frac{1}{2} \lambda \sum_{j=1}^{T} w_j^2
$$
其中 $T$ 为叶节点数量，$w_j$ 为第 $j$ 个叶节点的输出权重。

此外 XGBoost 还有很多其他的优化内容，此处便不再展开。因为这毕竟不是 ML Models Wiki。

### **Stacking**

Stacking 使用多个不同模型作为第一层基学习器，并将其预测结果作为新的输入特征：
$$
z(\mathbf x) = \begin{bmatrix} f_1(\mathbf x) \\ f_2(\mathbf x) \\ \vdots \\ f_M(\mathbf x) \end{bmatrix}
$$
再训练元学习器 $g$：
$$
F(\mathbf x) = g \left( \mathbf z(\mathbf x) \right) = g \left( f_1(\mathbf x),\ldots,f_M(\mathbf x) \right)
$$
为避免数据泄漏，元学习器通常使用基学习器的 Out-of-Fold 预测进行训练。


---


那 Classical Model 的内容大概就到这里了。这篇笔记虽然整体上基本是照搬 wiki，但是因为经过了整理和标签化，随时备查和建立一个好的 landscape 还是比较好的。Fine
