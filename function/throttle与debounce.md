## throttle与debounce
### 引子
在谈论这两个函数之前，先来看一个前端开发中经常遇到的场景：

> 在页面中，我们有一个“查询”按钮，单击该按钮，会通过 `ajax` 异步查询一些数据

假设这个查询是耗时的， 并且会给后端造成一定压力，那么如果短时间内我们频繁点击该按钮，`ajax` 请求就会不断发出，这样给后端造成的压力是难以想象的。因此，我们会想到控制我们的查询速率，为此，我们可能会这样做：

#### 独占性提交

通过设置一个 `flag` 来标识当前正在请求中，如果已在请求中，则不允许再次请求，请求完成，刷新该 `flag` 来允许新的请求提交

```javascript
var isQuerying = false;

var sendQuery = function(complete) {
	// 如果已经在查询了，那么需要等待
	if(isQuerying){
	    console.log("waiting");
	    return;
	  }
	console.log("send query");
	// 标识当前正在查询中
	isQuerying = true;
	// 我们模拟一个耗时操作
	setTimeout(function(){
	 complete && complete();    
  },2000);
}

var complete = function() {
   // 在回调中， 我们刷新标记量
   isQuerying = false;
   console.log("completed");
}

$("#queryBtn").click(function(){sendQuery(complete);});

// 测试一下， 可以看到新的请求不再立即被送出
for(var i=0;i<100;i++) {
  $("#queryBtn").click();
}
```

---------------


#### 节制型提交
在独占型提交中，如果一个请求已经在进行中，那么再多的点击都会被废弃。那么如果我们只是想限制请求速率，而不想废弃掉之后的点击，那我们得考虑新的提交方式。先来开限制提交的问题本质：

> 控制回调发生的速率, 不需要回调发生那么快

由于我们的对查询按钮绑定的 `click` 事件必然会在按钮点击是发生，如下，`sendQuery` 函数必然会在 `click` 后被调用：

```javascript
$("#queryBtn").click(sendQuery);
```

但是，如果我们新建一个 `func` 来包裹一下 `sendQuery` 业务，那么在 `click` 事件后，`func` 被调用，在其执行过程中，我们有选择的考虑是否执行 `sendQuery`，亦即控制住 `sendQuery` 的调用频率。

假设我们想至少等待1s才能发出一次新的查询请求（及请求的调用频次不能超过__1次/秒__）， 那么应该这样设计：

1. 开始：`click` 事件到来， `func` 函数被调用
2. 获得当前时间，比较当前时间距上次 `sendQuery` 执行的时间是否已经足够 `1s` 。
3. 如果已经足够，那么这次查询请求可以立即被执行，否则计算应该等待的时间，延后执行该请求。

看代码:

```javascript
var previous = 0； // 记录上次执行的时间点
var waiting = 1000; // 需要等待的时间

var sendQuery = function() {
	// 执行的时候， 刷新previous
	previous = (new Date()).getTime();	
	console.log("sending query");
}

var func = function() {
	// 获得当前时间
	var now = (new Date()).getTime();
	// 获得需要等待的时间
	var remain = waiting-(now-previous);
	// 判断是否立即执行
	if(remain<=0) {
		sendQuery();		
	} else {
		setTimeout(sendQuery, remain);
	}		
}
```

为了防止变量的全局污染， 我们再用一个立即执行函数包裹下作用域：

```javascript
var delayedQuery = (function() {
  var previous = 0; // 记录上次执行的时间点
  var waiting = 1000; // 需要等待的时间

  var sendQuery = function() {
    // 执行的时候， 刷新previous
    previous = (new Date()).getTime();
    console.log("sending query");
  }

  return function() {
    // 获得当前时间
    var now = (new Date()).getTime();
    // 获得需要等待的时间
    var remain = waiting - (now - previous);
    console.log("need waiting " + remain + " ms");
    // 判断是否立即执行
    if (remain <= 0) {
      console.log("immediately");
      sendQuery();
    } else {
      console.log("delayed");
      setTimeout(sendQuery, remain);
    }
  }
})();

$("#queryBtn").click(delayedQuery);
```

但是，我们的业务代码 `sendQuery` 还是去耦合了刷新 `previous` 的逻辑，并且，每个延迟执行的诉求都要去做这样一个包裹，样板代码就显得太多了。现在我们撰写一个通用函数，我们将（1）`需要控制调用频度的函数` 和（2）`对调用频度的限制` 传递给他，他能够返回一个限制了执行频率的函数。

```javascript
/**
 * throttle
 * @param {Function} func 待控制频率的函数
 * @param {Number} waiting 每次调用的最小等待周期
 */
function throttle(func,waiting) {
	var previous = 0;
	
	// 创建一个func的wrapper，如要是解耦func与previous等变量
	var later = function() {
		// 刷新previous
		previous = (new Date()).getTime();
		// 执行调用
		func();	
	}
	// 返回一个被控制了调用频率的
	return function() {
		// 获得当前时间
	    var now = (new Date()).getTime();
	    // 获得需要等待的时间
	    var remain = waiting - (now - previous);
	    console.log("need waiting " + remain + " ms");
	    // 判断是否立即执行
	    if (remain <= 0) {
	      console.log("immediately");
	      later();
 	    } else {
	      console.log("delayed");
	      setTimeout(later, remain);
	    }
	}
}

// 现在，刷新previous不再需要耦合到sendQuery中
var sendQuery = function() {
	console.log("sending query");
}

delayedQuery = throttle(sendQuery,1000);
```

[查看演示](https://jsfiddle.net/softshot/r6uh3xug/2/)


------------

### underscore中的throttle
可以看出来， 这里我已经用了 `throttle` 来命名我们的函数了，`throttle`，也就是节流阀的意思，很形象是吧，通过这样一个阀门，我们限制函数的执行频次。

但是在上面的演示中，还有一点小问题，一些点击的查询回调虽然被延迟执行了，但是在某个时间点，他们好像一起执行了，这是因为 `setTimeout(func, wait)` 并不能保证 `func` 的执行开始时间，只能保证 `func` 在不早于从现在起到 `wait` 毫秒后发生。所以被延后执行的那些查询在某个相近的时间点同时发生了。

出现这个错误的原因就是：
> 我们只保障了第一次回调和接下来所有回调的间隔执行，而没有保障到各个回调间相互的间隔执行。

下面可以看一下underscore中 `throttle` 的实现，比刚才我们写的throttle函数健壮许多。

```javascript
_.throttle = function (func, wait, options) {
        // timeout标识最近一次被追踪的调用
        // context和args缓存func执行时需要的上下文，result缓存func执行结果
        var timeout, context, args, result;
        // 最近一次func被调用的时间点
        var previous = 0;
        if (!options) options = {};

        // 创建一个延后执行的函数包裹住func的执行过程
        var later = function () {
            // 执行时，刷新最近一次调用时间
            previous = options.leading === false ? 0 : _.now();
            // 清空为此次执行设置的定时器
            timeout = null;
            result = func.apply(context, args);
            if (!timeout) context = args = null;
        };

        // 返回一个throttle化的函数
        var throttled = function () {
            // 我们尝试调用func时，会首先记录当前时间戳
            var now = _.now();
            // 是否是第一次调用
            if (!previous && options.leading === false) previous = now;
            // func还要等待多久才能被调用 = 预设的最小等待期-（当前时间-上一次调用的时间）
            var remaining = wait - (now - previous);
            // 记录执行时需要的上下文和参数
            context = this;
            args = arguments;
            // 如果计算后能被立即执行
            if (remaining <= 0 || remaining > wait) {
                // 清除之前的设置的延时执行，就不存在某些回调一同发生的情况了
                if (timeout) {
                    clearTimeout(timeout);
                    timeout = null;
                }
                // 刷新最近一次func调用的时间点
                previous = now;
                // 执行func调用
                result = func.apply(context, args);
                // 再次检查timeout，因为func执行期间可能有新的timeout被设置，如果timeout被清空了，代表不再有等待执行的func，也清空context和args
                if (!timeout) context = args = null;
            } else if (!timeout && options.trailing !== false) {
                // 如果设置了trailing edge，那么暂缓此次调用尝试的执行
                timeout = setTimeout(later, remaining);
            }
            return result;
        };

        // 不再控制函数执行调用频率
        throttled.cancel = function () {
            clearTimeout(timeout);
            previous = 0;
            timeout = context = args = null;
        };

        return throttled;
    };

```

> 与我们所写的 `throttle` 不同的是，underscore中的 `throttle` 并不需要为每次回调都设置一个定时器来延后执行。他的定时器只记录最新一次的调用尝试。比如 `waiting` 为 `1s`，在 `1.5s` 内我们单击了查询按钮 `20` 次，真正会被送出的查询只有至多两次，分别是第一次和最后一次。这就不会出现上面延时中出现的“某时刻一些延时函数同时发生”的情况了。

在underscore的实现中，有个令人疑惑的判断条件：

```javascript
if (remaining <= 0 || remaining > wait)
```

当该条件成立时， 可以立即执行 `func`，`remaining<=0` 的条件很容易理解，就是__不再需要等待时__，那么如何理解 `remaining > wait` 呢?

显然，`remaining>wait` 等同于 `now<previous`， 亦即：`previous` 的被刷新晚于 `now` 的被设置。

这种情况就发生在我们当前尝试调用时，并且设置了当前时间点 `now` 之后，上次延时的函数 `later` 开始了执行， 并刷新了 `previous`，此时出现了 `now` 早于 `previous` 的情况。举个栗子：

1. 开始时，我们 `click` 了一次查询按钮，我们将之命名为 `click1`，此时 `previous==0`
2. 在 `0.4s` 时我们 `click` 了一次查询按钮 `click2`，`now==0.4`, `previous==0`, 则这次点击的查询会至少等待 `0.6s` 才送出，也就是最快要在 `1s` 的时候 `click2` 的查询请求才送出。（由于 `setTimeout(func, wait)` 并不能保证 `func` 的执行开始时间，只能保证 `func` 不早于从现在起到 `wait` 毫秒后发生， 所以 `click2` 的查询请求并不一定在 `1s` 时就能够被送出）
3. 在 `1.2s` 时，产生 `click3`，`now==1.2`

则存在如下两种情况
* `click2` 的查询先于 `click3` 发生，比如在 `1.1s` 时 `click2` 的回调被执行，那么 `click3` 的回调要等 `1-(1.2-1.1)==0.9s` 才发生
* `1.3s` 时 `click2` 的查询请求开始执行，`previous==1.3`，`remaining=1-(1.2-1.3)==1.1>1`，此时，underscore会让 `click3` 的查询请求也开始执行（既不会停止 `click` 的查询请求，也不会停止 `click3` 的查询请求），`click3` 和 `click2` 的返回结果取最近一次。（这样做的目的暂时揣摩不到）

#### leading edge与trailing edge
underscore中的 `throttle` 函数提供了第三个参数 `options` 来进行选项配置，并且支持如下两个参数：

1. `leading`：是否设置 `节流前缘--leading edge` ，前缘的作用是保证第一次尝试调用的 `func` 会被立即执行，否则第一次调用也必须等待 `wait` 时间，默认为 `true`。

2. `trailing`：是否设置 `节流后缘--trailing edge` ，后缘的作用是：当最近一次尝试调用 `func` 时，如果 `func` 不能立即执行，会延后 `func` 的执行，默认为 `true`。

这两个配置会带来总共四种组合，通过[这个演示](https://jsfiddle.net/softshot/Lakgk99q/9/)，观察不同组合的效果。

-----------------------------

### debounce

在实际项目中，我们还有一种需求，就是如果过于频繁的尝试调用某个函数时，只允许一次调用成功执行。仍然以点击查询按钮异步查询为例，假设我们每次点击的时间间隔都在 `1s` 内，那么所有的点击只有一次能送出请求，要么是第一次，要么是最后一次。显然，`throttle` 是做不到这点的，`throttle` 会至少送出两次请求。针对于此，underscore又撰写了 `debounce` 函数。

顾名思义， `debounce` --防反跳，就是不再跳起，不再响应的意思。

> `throttle` 和 `debounce` 并非underscore独有，他们不仅仅是函数，也是解决问题的方式，诸如jquery，lodash等知名库都提供了这两个方法。

从下面的 `debounce` 实现我们可以看到，不同于 `throttle`，`debounce` 不再计算 `remain` 时间，其提供的 `immediate` 参数类似于 `throttle` 中的对于 `leading-edge` 和 `trailing-edge` 的控制：

- `immediate === true`，开启 `leading-edge`，当可以执行时立即执行
- `immediate === false`（默认）开启 `trailing-edge`，当可以执行时也必须延后至少 `wait` 个时间才能执行。

因此，`debounce` 后的 `func` 要么立即获得响应，要么延迟一段时间才响应，[查看演示](https://jsfiddle.net/softshot/gamLjgcn/)。

```javascript
_.debounce = function (func, wait, immediate) {
        var timeout, result;

        var later = function (context, args) {
            timeout = null;
            if (args) result = func.apply(context, args);
        };

        var debounced = restArgs(function (args) {
            // 每次新的尝试调用func，会使抛弃之前等待的func
            if (timeout) clearTimeout(timeout);
            // 如果允许新的调用尝试立即执行，
            if (immediate) {
                // 如果之前尚没有调用尝试，那么此次调用可以立马执行，否则就需要等待
                var callNow = !timeout;
                // 刷新timeout
                timeout = setTimeout(later, wait);
                // 如果能被立即执行，立即执行
                if (callNow) result = func.apply(this, args);
            } else {
                // 否则，这次尝试调用会延时wait个时间
                timeout = _.delay(later, wait, this, args);
            }

            return result;
        });

        debounced.cancel = function () {
            clearTimeout(timeout);
            timeout = null;
        };

        return debounced;
    };
```
 
 -------------
 
### 应用场景

#### debounce的应用场景

一定要记住，`debounce` 满足的是：
> 高频下只响应一次

1. 遇上疯狂打字员，在输入框快速输入文字（高频），但是我们只想在其完全停止输入时再对输入文字做出处理（一次）。
2. AJAX，多数场景下，每个异步请求在短时间只能响应一次。比如下拉刷新，不停的到底（高频），但只发送一次ajax请求（一次）。

#### throttle的应用场景

相比 `debounce`，`throttle` 要更加宽松一些，其目的在于:
> 按频率执行调用。

1. 游戏中的按键响应，比如格斗，比如射击，需要控制出拳和射击的速率。
2. 自动完成，按照一定频率分析输入，提示自动完成。
3. 鼠标移动和窗口滚动，鼠标稍微移动一下，窗口稍微滚动一下会带来大量的事件，因而需要控制回调的发生频率。

--------------

### 参考资料

- [Debounce and Throttle: a visual explanation](http://drupalmotion.com/article/debounce-and-throttle-visual-explanation)
- [知乎@长天之云的回答](https://www.zhihu.com/question/19805411)
- [MDN setTimeout](https://developer.mozilla.org/zh-CN/docs/Web/API/Window/setTimeout)
- [浅谈 Underscore.js 中 _.throttle 和 _.debounce 的差异](https://blog.coding.net/blog/the-difference-between-throttle-and-debounce-in-underscorejs)
- [Underscore之throttle函数源码分析以及使用注意事项](http://www.easyui.info/archives/1853.html)

