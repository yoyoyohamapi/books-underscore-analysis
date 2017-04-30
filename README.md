写作意图
--------

起初，我分析 underscore 的源码只是想更深入的了解 **函数式编程（Functional Programming）**，但分析结束后，我就觉得单纯的源码注释不足以记录我的收获、理解和感悟，所以我想把这些写下来，我粗略地将写作意图概括如下：

-	函数式编程近些年非常火爆，诸如 haskwell 这样的纯函数式编程语言获得了非常高的社区活跃度。JavaScript 支持多范式编程，抛开 underscore 和 lodash 这样的生来为了函数编程的库不谈，诸如 [redux](https://github.com/reactjs/redux) 这样的库也大量运用了函数式编程，即便作为一个 react+redux 的业务开发者，想要深入理解的 redux 的实现机制，也不得不学习函数式编程。因此，学习函数式编程，将会成为 JavaScript 开发者的必须。

-	在阅读 underscore 的源码期间，被作者 jashkenas（他同时也是 backbone 和 coffee 的作者）的功力深深折服，一些功能可能我也能写出，但绝对写不了如此健壮。所以，深入学习 underscore 源码，不仅有助于我们认识函数式编程，也能深化我们对于 JavaScript 中一些基础知识的理解和掌握。

-	随着 backbone 的衰落和 lodash 的崛起，underscore 的热度已经不及当年，但是截止这篇文章的开始前的一个月，underscore 仍然有最新的 bug 修复，可见作者 jashkenas 仍然没有放弃 underscore 的维护。所以现在分析 underscore 的源码仍然不显得过时。相较于 lodash，underscore 的源码更加短小，也不太涉及 JavaScript 中的一些奇淫巧技，所以，分析 underscore 更加适合 JavaScript 开发者的进阶。在完成了 underscore 的源码分析后，希望我自己有时间，也希望读者有意愿再去分析 lodash 的源码，后者在性能和功能上都已经超越了 underscore，并且长时间霸占了 npm 了最热 package 的位置。

章节安排
--------

### [underscore 基础篇](base/README.md)

在基础部分，将会阐述 underscore 的大致结构及一些广泛用到的内部函数（internal function），这些函数被大量用到了 underscore 的 api 实现中，是我们之后理解 underscore 源码的必须途径。

之后，我们按照官方 API 文档的顺序来阐述 underscore 的源码实现，由于很多 API 的实现可以举一反三，所以，本书并不会啰嗦的阐述每个 api 的实现，如果真的由此需求，可以配合我写的 [underscore 中文注释](https://github.com/yoyoyohamapi/underscore/blob/master/underscore.analysis.js) 辅助阅读。

### [underscore 集合篇](collection/README.md)

不同于数学当中的集合，在 underscore 中，简单地定义集合为 **一个可迭代的序列**，相较于原生的 ES5 提供的迭代方法，underscore 不仅能够对数组进行迭代，还能够对对象进行迭代。

### [underscore 数组篇](array/README.md)

这一章节我们将介绍 underscore 中提供的针对数组的操作，部分 API 已经在集合篇中有过阐述，不再赘述。

### [underscore 函数篇](function/README.md)

在 JavaScript 中，函数是第一型的对象，函数在 JavaScript 中的地位因此可见一斑。这一章节也是我认为最为重要的一章，在本章中，能够见到许多实用的针对函数的操作，以及函数式编程中的重要概念。

### [underscore 对象篇](object/README.md)

本章中，将介绍 underscore 中操作对象的 api。

### [underscore 实用工具篇](utils/README.md)

underscore 还提供了不少工具函数，来提供一些周边功能，如字符逃逸等。但其中最重要的是其提供的模板引擎工具，我将会花费很大笔墨对其进行描述。

### [underscore 内容拾遗](supply/README.md)

最后，在收尾阶段，我们还会介绍 underscore 提供的面向对象风格（OOP Style），链式调用（Chain）等内容。

感谢
----

本文基于 underscore 的 [1.8.3 版本](https://github.com/jashkenas/underscore/tree/1.8.3) 进行分析, 在阅读官方文档时遇到的困难时，特别感谢 [underscore 中文教程](http://www.css88.com/doc/underscore/) 提供的帮助。

> 欢迎转载或者引用，但请注明出处，这算是对我工作成果的认可和尊重。也欢迎拍砖，相应问题可以发到 [discussion](https://www.gitbook.com/book/yoyoyohamapi/undersercore-analysis/discussions)，我会最快时间进行更正或者解答。
