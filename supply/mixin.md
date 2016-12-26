mixin
=====

mixin（混入）模式是增加代码复用度的一个广泛使用的设计模式，什么是mixin模式，简言之，就是向一个对象混入一系列方法，使之具备更强大的能力，这一些列方法我们又会包裹在一个称之为mixin的对象中，这样，其他对象也能够给通过该mixin进行扩展：

![mixin](https://www.safaribooksonline.com/library/view/learning-javascript-design/9781449334840/httpatomoreillycomsourceoreillyimages1326900.png)

相较于继承，我们发现，mixin的对象组织更加松散，因而也就不用面对如何定义类，类的抽象程度到什么地步诸如此类的在继承中出现的问题。反正想要功能，ok，直接混入一下就好。

### mixin模式的传统实现

mixin的传统实现是为mixin先创建一个对象，比如下例就是一个模态框的mixin：

```js
const modalMixin = {
    open() {
        console.log(`opening`);
    },
    close() {
        console.log('closing')
    }
};
```

然后创建一个`extend`方法，该方法用来拷贝mixin对象中的方法到一般对象中，借此增强原对象的功能：

```js
/**
 * extend
 * @param  {Object} obj
 * @param  {Object} mixin
 */
function extend(obj, mixin) {
    Object.keys(mixin).map((func) => {
        obj[func] = mixin[func]
    });
}

// 一个普通的对话框
function Dialog(title) {
    this.title = title;
}

Dialog.prototype.confirm() {
    console.log('confirm?');
}

// 通过mixin扩展该对话框的功能，使之能够关闭和打开
extend(Dialog.prototype, modalMixin);
let dialog = new Dialog('News: xxxx');
dialog.open(); // => 'opening'
```

### mixin模式的函数实现

在js这类支持多范式编程的语言中，还会直接将mixin设计为一个函数，从而跳过中间件`extend`：

```js
function modalMixin() {
    this.open = function () {
        console.log('opening')
    };
    this.close = function () {
        console.log('closing');
    };
    // 返回对象，便于进行链式的混入
    return this;
}
```

通过委托（delegate）模式的`Function.prototype.call`获得`Function.prototype.apply`进行对象和mixin的绑定：

```js
modalMixin.call(Dialog.prototype);
dialog.open(); // => 'opening'
```

再通过闭包做下缓存，避免每次混入时都要重新创建函数：

```js
const modalMixin = (function () {
    const open = function () {
        console.log('opening')
    };
    const close = function () {
        console.log('closing');
    };
    return function() {
        this.open = open;
        this.close = close;
        return this;
    };
})();
```

### underscore中的`_.mixin()`

源码：

```js
_.mixin = function (obj) {
    _.each(_.functions(obj), function (name) {
        var func = _[name] = obj[name];
        _.prototype[name] = function () {
            var args = [this._wrapped];
            push.apply(args, arguments);
            return chainResult(this, func.apply(_, args));
        };
    });
    return _;
};
```

underscore中的`mixin(obj)`将会用传入的`obj`来扩充`_`原型上的功能，并且也是用的委托模式的`apply`，另外通过`chainResult`考虑了扩充的函数能够进行链式调用（`chainResult`将在后文进行介绍）。源码中的这个代码片还值得看看：

```js
_.mixin = function(obj) {
    // ...
            var args = [this._wrapped];
            push.apply(args, arguments);
            return chainResult(this, func.apply(_, args));
    // ...
}
```

该代码片考虑到了当我们想要以面向对象的风格调用underscore函数时的情况：

```js
_.mixin({
  capitalize: function(string) {
    return string.charAt(0).toUpperCase() + string.substring(1).toLowerCase();
  }
});
_("fabio").capitalize();
// => "Fabio"
```

这时候，capitalize的`this`会被绑定到`_`对象上，同时，函数的首个参数将会被设置为"fabio"，从而相当于这样调用：

```js
_.capitalize("fabio");
// => "Fabio"
```

最后要提的时，underscore默认通过`_.mixin(_)`这一语句混入了所有方法到包裹后的对象上，以便包裹后的对象能够调用underscore上的方法：

```js
_([1, 2, 3]).map(n => n*2);
```

### 不要滥用mixin

mixin不总是那么美好的，从其实现原理我们就可以看到，mixin的侵入性很强，他很有可能污染原来的原型，从而引起误会：

```js
_.mixin({
  map: function(array) {
    console.log('map is broken!');
  }
});

_([1,2,3]).map(n => n*2);
// => map is broken!
```

### 参考资料

-	[A fresh look at JavaScript Mixins](https://javascriptweblog.wordpress.com/2011/05/31/a-fresh-look-at-javascript-mixins/)
-	[ Learning JavaScript Design Patterns - Mixin](https://www.safaribooksonline.com/library/view/learning-javascript-design/9781449334840/ch09s13.html)
