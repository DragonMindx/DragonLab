---
title: Kaggle5 IMDB 情感分析
date: 2026-07-24
tags:
  - NLP
categories: Kaggle
mathjax: true
---
## 07/24/2026

依旧Kaggle数据集。最近正好在学NLP，跑一下IMDB影评情感分析

因为是前几天做的了，这里就按整理报告的形式而非随笔记了

---

### V0 Baseline : Naive RNN

IMDB数据集给出的形式非常简单，Col 1 是Review ， 一串评论文本。 Col 2则是positive/negative的二分标记。整个系统也就是一个NLP二分类问题。

处理的Baseline如下

文本清理，去除标点和HTML标签——Tokenize+用PAD填补空缺成定长序列——Embedding词向量初始化——RNN根据训练集标签学习参数——使用最终隐状态 $h_T$ 乘参数 $w_T$ 后用 $sigmoid$ 归一化函数做二分类

参数选择的详情对结果影响不大（我忘了），最终结果如下

epoch 1 : 0.50
epoch 10 : 0.52

Naive RNN根本在胡乱猜，训练完全学不到东西

检查发现，每条文本末端的PAD在链式传导时被RNN大量保留，也就是最后RNN几乎完全学不到别的东西，全是占位符，然后瞎猜。属于严肃工程失误

### V1 : Corrected RNN

把V0的PAD处理掉，让RNN每次真的学到的是Token

这次的RNN能够学到正确的信息。数据如

DEVICE: cuda
GPU: NVIDIA GeForce RTX 5070 Ti Laptop GPU
Train size: 40000
Val size: 10000
Train positive ratio: 0.5
Val positive ratio: 0.5
Actual vocab size: 30002
Model device: cuda:0
Parameter count: 9055769

E01  train_loss:0.6423  train_acc:0.6248  val_loss:0.5854  val_acc:0.7038  grad_norm:0.9022
E02  train_loss:0.5542  train_acc:0.7339  val_loss:0.5425  val_acc:0.7435  grad_norm:1.7135
E03  train_loss:0.4988  train_acc:0.7726  val_loss:0.5105  val_acc:0.7653  grad_norm:1.4343
E04  train_loss:0.4535  train_acc:0.8020  val_loss:0.5210  val_acc:0.7496  grad_norm:1.4236
E05  train_loss:0.4138  train_acc:0.8223  val_loss:0.4960  val_acc:0.7935  grad_norm:2.4778
E06  train_loss:0.3738  train_acc:0.8454  val_loss:0.5119  val_acc:0.7812  grad_norm:1.4384
E07  train_loss:0.3365  train_acc:0.8630  val_loss:0.5005  val_acc:0.7995  grad_norm:3.3801
E08  train_loss:0.2997  train_acc:0.8812  val_loss:0.4978  val_acc:0.7899  grad_norm:1.1420
E09  train_loss:0.2654  train_acc:0.8965  val_loss:0.5076  val_acc:0.7927  grad_norm:1.5417
E10  train_loss:0.2392  train_acc:0.9096  val_loss:0.5670  val_acc:0.7870  grad_norm:2.6650
E11  train_loss:0.2092  train_acc:0.9234  val_loss:0.5570  val_acc:0.7855  grad_norm:1.5254
E12  train_loss:0.1871  train_acc:0.9323  val_loss:0.5825  val_acc:0.7810  grad_norm:1.3862
E13  train_loss:0.1645  train_acc:0.9428  val_loss:0.6691  val_acc:0.8024  grad_norm:1.3854
E14  train_loss:0.1430  train_acc:0.9505  val_loss:0.6520  val_acc:0.7942  grad_norm:1.9809
E15  train_loss:0.1214  train_acc:0.9590  val_loss:0.7313  val_acc:0.7794  grad_norm:1.1293
E16  train_loss:0.1032  train_acc:0.9667  val_loss:0.7542  val_acc:0.7840  grad_norm:5.5989
E17  train_loss:0.0900  train_acc:0.9707  val_loss:0.8872  val_acc:0.7547  grad_norm:1.0979
E18  train_loss:0.0895  train_acc:0.9715  val_loss:0.8697  val_acc:0.7910  grad_norm:2.6056
E19  train_loss:0.0764  train_acc:0.9758  val_loss:0.8958  val_acc:0.7843  grad_norm:1.5036
E20  train_loss:0.0629  train_acc:0.9798  val_loss:0.9909  val_acc:0.7888  grad_norm:0.9162
E21  train_loss:0.0606  train_acc:0.9816  val_loss:0.9539  val_acc:0.7646  grad_norm:1.6183
E22  train_loss:0.0569  train_acc:0.9830  val_loss:0.9953  val_acc:0.7767  grad_norm:1.2125
E23  train_loss:0.0466  train_acc:0.9853  val_loss:1.0580  val_acc:0.7740  grad_norm:1.0785
E24  train_loss:0.0488  train_acc:0.9850  val_loss:1.0219  val_acc:0.7995  grad_norm:1.0655
E25  train_loss:0.0462  train_acc:0.9861  val_loss:1.0568  val_acc:0.7886  grad_norm:1.7165
E26  train_loss:0.0385  train_acc:0.9887  val_loss:1.1097  val_acc:0.7828  grad_norm:1.3422
E27  train_loss:0.0422  train_acc:0.9880  val_loss:1.1634  val_acc:0.7829  grad_norm:0.9275
E28  train_loss:0.0433  train_acc:0.9871  val_loss:1.1126  val_acc:0.7856  grad_norm:1.0841
E29  train_loss:0.0390  train_acc:0.9883  val_loss:1.2094  val_acc:0.7705  grad_norm:1.0117
E30  train_loss:0.0413  train_acc:0.9884  val_loss:1.1202  val_acc:0.7881  grad_norm:1.7053

| best_epoch=13 | best_val_acc=0.8024

与此同时我还记录到了非常典型的overfitting曲线

![[training_plot.png]]

此刻过拟合具象化了

最佳表现大概在0.80左右。坦白说对于300词长的句子，这应该差不多是Vanilla RNN的极限。不过who knows ? 所以我又做了一点点小改进

## V2 : BiRNN + MeanPooling

在Vanilla RNN的基础上，增加反向的通路改成双向RNN，同时对所有隐状态取均值，防止两端的记忆被忘记

结果是非常不错的。看起来能够充分结合上下文的RNN效果提升巨大，最佳acc到达0.88左右。

Device: cuda
Vocabulary: 30002
BiRNN-Mean E01 | train_loss=0.4367 | train_acc=0.7913 | val_acc=0.8595 | grad=0.6733
BiRNN-Mean E02 | train_loss=0.2696 | train_acc=0.8905 | val_acc=0.8821 | grad=0.6423
BiRNN-Mean E03 | train_loss=0.1945 | train_acc=0.9259 | val_acc=0.8699 | grad=0.5692
BiRNN-Mean E04 | train_loss=0.1442 | train_acc=0.9464 | val_acc=0.8844 | grad=0.2964
BiRNN-Mean E05 | train_loss=0.0988 | train_acc=0.9653 | val_acc=0.8815 | grad=0.9433
BiRNN-Mean E06 | train_loss=0.0628 | train_acc=0.9788 | val_acc=0.8804 | grad=0.7828
BiRNN-Mean E07 | train_loss=0.0392 | train_acc=0.9871 | val_acc=0.8767 | grad=1.0125
BiRNN-Mean E08 | train_loss=0.0241 | train_acc=0.9928 | val_acc=0.8780 | grad=0.5311
BiRNN-Mean E09 | train_loss=0.0150 | train_acc=0.9955 | val_acc=0.8781 | grad=0.8190
BiRNN-Mean E10 | train_loss=0.0124 | train_acc=0.9961 | val_acc=0.8664 | grad=0.4338
BiRNN-Mean E11 | train_loss=0.0108 | train_acc=0.9967 | val_acc=0.8710 | grad=0.1554
BiRNN-Mean E12 | train_loss=0.0126 | train_acc=0.9960 | val_acc=0.8705 | grad=1.3185
BiRNN-Mean E13 | train_loss=0.0075 | train_acc=0.9978 | val_acc=0.8729 | grad=0.2290
BiRNN-Mean E14 | train_loss=0.0099 | train_acc=0.9968 | val_acc=0.8715 | grad=0.9392
BiRNN-Mean E15 | train_loss=0.0116 | train_acc=0.9962 | val_acc=0.8758 | grad=0.1768
BiRNN-Mean E16 | train_loss=0.0083 | train_acc=0.9976 | val_acc=0.8764 | grad=0.5431
BiRNN-Mean E17 | train_loss=0.0071 | train_acc=0.9977 | val_acc=0.8719 | grad=0.2731
BiRNN-Mean E18 | train_loss=0.0051 | train_acc=0.9985 | val_acc=0.8774 | grad=0.3575
BiRNN-Mean E19 | train_loss=0.0071 | train_acc=0.9977 | val_acc=0.8730 | grad=0.0862
BiRNN-Mean E20 | train_loss=0.0049 | train_acc=0.9985 | val_acc=0.8722 | grad=0.5042
BiRNN-Mean E21 | train_loss=0.0046 | train_acc=0.9984 | val_acc=0.8732 | grad=0.7326
BiRNN-Mean E22 | train_loss=0.0051 | train_acc=0.9984 | val_acc=0.8735 | grad=0.2510
BiRNN-Mean E23 | train_loss=0.0047 | train_acc=0.9984 | val_acc=0.8711 | grad=0.0976
BiRNN-Mean E24 | train_loss=0.0050 | train_acc=0.9981 | val_acc=0.8716 | grad=0.0027
BiRNN-Mean E25 | train_loss=0.0063 | train_acc=0.9980 | val_acc=0.8723 | grad=0.2158
BiRNN-Mean E26 | train_loss=0.0068 | train_acc=0.9976 | val_acc=0.8661 | grad=0.8994
BiRNN-Mean E27 | train_loss=0.0037 | train_acc=0.9988 | val_acc=0.8719 | grad=0.0180
BiRNN-Mean E28 | train_loss=0.0016 | train_acc=0.9995 | val_acc=0.8727 | grad=0.0776
BiRNN-Mean E29 | train_loss=0.0046 | train_acc=0.9985 | val_acc=0.8717 | grad=1.7201
BiRNN-Mean E30 | train_loss=0.0055 | train_acc=0.9982 | val_acc=0.8721 | grad=0.0208

Best Val Acc: 0.8844

### V3 ： BiGRU

RNN的下一步当然是LSTM，不过这里采用的是其简单实现版GRU，因为看起来模型的复杂程度并不是决定性的。

改动不大，只需要简单调整model即可。此外已经记录过overfitting的数据，后续的训练也加上了早停，降低我显卡的负担（

但是其实并没有出现预想中的巨大飞跃。只有一组种子实现了比较小的提升

Experiment: BiGRU-Mean | seed=52
E01 | train_loss=0.4508 | train_acc=0.7817 | val_loss=0.3512 | val_acc=0.8435
E02 | train_loss=0.2985 | train_acc=0.8749 | val_loss=0.2953 | val_acc=0.8696
E03 | train_loss=0.2282 | train_acc=0.9093 | val_loss=0.2863 | val_acc=0.8802
**E04 | train_loss=0.1743 | train_acc=0.9327 | val_loss=0.2840 | val_acc=0.8905**
E05 | train_loss=0.1250 | train_acc=0.9536 | val_loss=0.3624 | val_acc=0.8824
E06 | train_loss=0.0782 | train_acc=0.9728 | val_loss=0.3729 | val_acc=0.8905
E07 | train_loss=0.0431 | train_acc=0.9862 | val_loss=0.5208 | val_acc=0.8908
BiGRU-Mean-S52: early stopping at epoch 7

可以看到采用BiGRU只提升了大概一个点，这还是在三组实验中效果最好的seed52。S42和S62甚至没能超越BiRNN的表现

在IMDB上决定最终效果的是上下文阅读能力，还是模型的形式呢

继续使用新的模型进行实验吧

### V4 : Transformer

为了验证0.89是RNN族模型的极限，还是当前数据质量和实际可行的极限，V4进入了Transformer架构。Baseline全部重构，采用self-attention去阅读文本，给出分类。效果会如何呢

效果并不如何。纯血Transformer还是没能做到预想中的一飞冲天。依旧选取最好的种子

Experiment: Transformer-Global | seed=52
 E01 | train_loss=0.5078 | train_acc=0.7375 | val_loss=0.3999 | val_acc=0.8309
 E02 | train_loss=0.3662 | train_acc=0.8361 | val_loss=0.3861 | val_acc=0.8518
 E03 | train_loss=0.3199 | train_acc=0.8622 | val_loss=0.3548 | val_acc=0.8702
 E04 | train_loss=0.2876 | train_acc=0.8804 | val_loss=0.3392 | val_acc=0.8761
 E05 | train_loss=0.2645 | train_acc=0.8904 | val_loss=0.3113 | val_acc=0.8809
 E06 | train_loss=0.2478 | train_acc=0.8981 | val_loss=0.3386 | val_acc=0.8828
 E07 | train_loss=0.2300 | train_acc=0.9069 | val_loss=0.3141 | val_acc=0.8864
 E08 | train_loss=0.2142 | train_acc=0.9144 | val_loss=0.3322 | val_acc=0.8867
Transformer-Global-S52: early stopping at epoch 8

这真的没搞错吗，可是是真的没搞错。Transformer在IMDB也仅仅取得了和BiRNN/BiGRU相近的结果，只是计算速度略快几十秒

于是我决定考察一下限制窗口之后Transformer的表现

### V5 : Experiment Matrix

我进行了多批量实验，分别取消Transformer的位置编码、限制其注意力在局部窗口，以及打乱语序等等，然后跑实验，结合所有实验数据得到了这张表
### 多 seed ablation 最佳单次 run

| 模型组合 | Best run | Best epoch | train_acc | val_loss | val_acc |
|---|---|---:|---:|---:|---:|
| BiGRU-Mean | BiGRU-Mean-S52 | 7 | 0.9862 | 0.5208 | 0.8908 |
| Transformer-Global-Shuffled | Transformer-Global-Shuffled-S52 | 9 | 0.9204 | 0.3265 | 0.8875 |
| Transformer-Global | Transformer-Global-S52 | 8 | 0.9144 | 0.3322 | 0.8867 |
| Transformer-NoPos | Transformer-NoPos-S62 | 5 | 0.9266 | 0.3006 | 0.8790 |
| Transformer-Window16 | Transformer-Window16-S62 | 3 | 0.8608 | nan | 0.6136 |
| Transformer-Window4 | Transformer-Window4-S62 | 3 | 0.8618 | nan | 0.6034 |

### 多 seed 平均表现排序

| 排名 | 模型组合 | mean_val_acc | std_val_acc | mean_val_loss | 参数量 | 平均耗时/s |
|---:|---|---:|---:|---:|---:|---:|
| 1 | BiGRU-Mean | 0.887467 | 0.002639 | 0.281540 | 8,601,089 | 324.16 |
| 2 | Transformer-Global-Shuffled | 0.879567 | 0.005311 | 0.317476 | 8,767,745 | 227.18 |
| 3 | Transformer-NoPos | 0.877733 | 0.000874 | 0.298803 | 8,767,745 | 186.90 |
| 4 | Transformer-Global | 0.877367 | 0.003075 | 0.317782 | 8,767,745 | 165.65 |
| 5 | Transformer-Window16 | 0.000000 | 0.000000 | inf | 8,767,745 | 66.64 |
| 6 | Transformer-Window4 | 0.000000 | 0.000000 | inf | 8,767,745 | 71.24 |

被卡住上下文窗口的Transformer一夜成区，学习效果比瞎蒙根本好不了多少。而即便是放开约束的Transformer，也并没有取得极高的分数。在均衡效果上，反而是BiGRU-Mean的模型组合最为鲁棒。均验证准确率为 **0.8875**。

另外，Transformer-Global 与 Transformer-Global-Shuffled 的单次最佳接近 0.887，打乱位置后仍接近，侧面说明该任务里词汇/全局共现信号很强。换句话说，情感倾向主要由部分情感表达强烈的词语给出，而较少依赖于对整个句子的理解。这和情感趋势的预测目标也是比较吻合的。我想一句话里出现大量的excellent , remarkable , marvelous之类的词也基本可以确定句子的情感倾向了

这个论断进行了实验。发现模型强 positive 倾向包括：

`gem, series, dvd, pleasure, touching, beautifully, enjoyable, small, best, admit, awesome, beauty, nature, stewart, lives`

而模型强 negative 倾向包括：

`bored, male, ugly, bad, fails, mean, off, reasons, even, lame, disappointing, sadly, interest, dull, boring`

由此也大概可以看出，早期 RNN 系列在 0.80 左右停住，主要瓶颈不只是 cell 类型，而是序列信息聚合方式与过拟合控制。改变组织方式和提高信息利用能力，在IMDB这样的数据集上比盲目升级更复杂的模型更有利于效果的提升。Attention 的价值可能不是“更聪明地理解语言”，而是提供一种高效的全局信息交互机制，同时为Parallelization提供可行性；但具体任务里，真正需要的是多少全局信息，需要实验确定。

这和我所喜欢的机器学习理念也许有一些相通之处。模型性能提升来自于对任务信息结构的有效利用，而非模型复杂度本身。

### Future Work: Dynamic Context Binding

在实验中发现的几点：

1. Global Attention 显著优于 Window Attention；
2. 但 IMDB 中完整 Global Attention 并没有显著超过 BiGRU；
3. 说明问题可能不是简单扩大感受野，而是如何高效选择有效上下文。

同时结合实验中我也进行的一些窗口间相关交叉计算，而不是以词汇为单元的密集注意力的效果

我产生了一个很有意思的想法是：

> 根据 token 间动态相关性建立稀疏信息连接，而非固定窗口或完全密集 Attention。从而复用计算结果，降低计算量

当然目前尚未进一步研究，仅作为之后可考察的小方向。

---

我考察回来了。我去看了DeepSeek-v4的最新技术报告，结果真的在其中的稀疏注意力找到了相关内容。整理之后的信息如下：

DSV4将三条信息通路并联起来，避免避免完全密集的全局注意力或者简单的Sliding Window

当前 Query Token
│
├─ Local branch
│   └─ 直接读取最近 128 个未压缩 Token
│
├─ CSA branch
│   ├─ 将相邻 KV Token 压缩成 Block
│   ├─ Lightning Indexer 在全局 Block 中计算相关性
│   └─ 只选 Top-K 高相关 Block 做正式 Attention
│
└─ HCA branch
    ├─ 每 128 个 Token 压缩成一个全局表示
    └─ 对所有高度压缩后的 Block 做 Dense Attention

并且 **CSA 与 HCA 层是交错部署的**。我所提出的“把句子截断成块，在保留局部窗口的同时，让不同块之间发生选择性的交叉计算。”实际上已经与这较为接近。

报告明确写道，CSA 先沿序列维度压缩 KV，再由 Lightning Indexer 为每个 Query 选择最相关的 Top-K 压缩块；同时另开一条 Sliding Window 分支，保留局部细粒度信息。HCA 则把更大的 Token 块压成一个 KV 条目，再对压缩后的全局序列进行密集计算。

此外，DeepSeek Sparse Attention 的 Lightning Indexer 会先低成本计算 Query 与历史 Token 或压缩块的相关分数，再只保留 Top-K 条目交给真正昂贵的 Attention。这套 DSA 最早已在 DeepSeek-V3.2 中明确提出，V4 则把它进一步推进到“先压缩、再稀疏选择”的 CSA。

也就是说，我所想到的“先粗略发现高相关对象-把这些对象 Bind 到当前 Query-只复用这些关系做昂贵计算”在这里也重合了一部分

我不想说什么“我是DeepSeek首席科学家”之类大言不惭的话。但是实际上，IMDB中引导出的直觉确实与目前最先进的模型思路是同源的

当然我仍需要大量的学习和工程化。DSV4所以前沿不在于其提出了一个更好玩的点子，而是把这套点子真正做成Work&Cheap的工程系统。这仍是我所努力的目标。

但是说真的，看到自己的思路撞上前沿，思考的喜悦也便从中浮现。也许本应如此，学习，实践，思考。

更重要的，为解决问题，而不为别的什么。