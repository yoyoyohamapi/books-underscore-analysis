# 写作意图
----------

起初，我分析underscore的源码只是想更深入的了解__函数式编程（Functional Programming）__，但分析完成后，撰文发布的动机就不仅于此了。以下能简单概括我的写作意图：

- 函数式编程近些年非常火爆，诸如haskwell这样的纯函数式编程语言获得了非常高的社区活跃度。js支持多范式编程，抛开underscore和lodash这样的生来为了函数编程的库不谈，诸如[redux](https://github.com/reactjs/redux)这样的库也大量运用了函数式编程，即便作为一个react+redux的业务开发者，想要深入理解的redux的实现机制，也不得不学习函数式编程。因此，学习函数式编程，将会成为js开发者的必须。
- 在阅读underscore的源码期间，被作者jashkenas（他同时也是backbone和）的功力深深折服，一些功能可能我也能写出，但绝对写不了如此健壮。所以，深入学习underscore源码，不仅有助于我们认识函数式编程，也能深化我们对于js中一些基础知识的理解和掌握。
- 随着backbone的衰落和lodash的崛起，underscore的热度已经不及当年，但是截止这篇文章的开始前的一个月，underscore仍然有最新的bug修复，可见作者jashkenas仍然没有放弃undersocre的维护。所以现在分析underscore的源码仍然不显得过时。相较于lodash，underscore的源码更加短小，也不太涉及js中的一些奇淫巧技，所以，分析underscore更加适合js开发者的进阶。在完成了underscore的源码分析后，希望我自己有时间，也希望读者有意愿再去分析lodash的源码，后者在性能和功能上都已经被认为是超越了undersocre，并且长时间霸占了npm了最热package的位置。



# 章节安排
-------------

本书大致会分为以下章节：

### underscore基础部分
在基础部分，将会阐述一些undersocre的内部函数（internal function），这些函数被大量用到了underscore的api实现中，是我们之后理解underscore源码的必须途径。

之后，我们按照官方API文档的顺序来阐述underscore的源码实现，由于很多API的实现可以举一反三，所以，本书并不会啰嗦的阐述每个api的实现，如果真的由此需求，可以配合我写的[underscore中文注释](https://github.com/yoyoyohamapi/underscore/blob/master/underscore.js)辅助阅读。
### undersocre colletion（集合）篇
### underscore array（数组）篇
### undersocre function（函数）篇
### underscore object（对象）篇
### underscore utility（实用工具）篇



# 感谢
---------

本文基于underscore的[1.8.3版本](https://github.com/jashkenas/underscore/tree/1.8.3)进行分析, 在阅读官方文档时遇到的困难时，特别感谢[underscore中文教程](http://www.css88.com/doc/underscore/)提供的帮助。

> 欢迎转载或者引用，但请注明出处，这算是对我工作成果的认可和尊重。也欢迎拍砖，相应问题可以发到issues，我会最快时间进行更正或者解答。