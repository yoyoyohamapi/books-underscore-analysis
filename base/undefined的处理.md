undefined 的处理
================

不可靠的 undefined
------------------

在 JavaScript 中，假设我们想判断一个是否是 `undefined`，那么我们通常会这样写：

```js
if(a === undefined){}
```

但是，JavaScript 中的 `undefined` 并不可靠，我们试着写这样一个函数：

```js
function test(a) {
  var undefined = 1;
  console.log(undefined); // => 1
  if(a===undefined) {
    // ...
  }
}
```

可以看到，`undefined` 被轻易地修改为了 `1`，使得我们之后的对于 `undefined` 理解引起歧义。所以，在 JavaScript 中，把 `undefined` 直接解释为 “未定义” 是有风险的，因为这个标识符可能被篡改。

> 在 ES5 之前，全局的 `undefined` 也是可以被修改的，而在 ES5 中，该标识符被设计为了只读标识符, 假如你现在的浏览器不是太老，你可以在控制台中输入以下语句测试一下：

```js
undefined = 1;
console.log(undefined); // => undefined
```

曲线救国
--------

现在我们能够明确的，标识符 `undefined` 并不能真正反映 “未定义”，所以我们得通过其他手段获得这一语义。幸好 JJavaScript 还提供了 `void` 运算符，该运算符会对指定的表达式求值，并返回受信的 `undefined`：

```js
void expression
```

最常见的用法是通过以下运算来获得 `undefined`，表达式为 `0` 时的运算开销最小：

```js
void 0;
// or
void(0);
```

在 underscore 中，所有需要获得 `undefined` 地方，都通过 `void 0` 进行了替代。

当然，曲线救国的方式不只一种，我们看到包裹 jquery 的立即执行函数：

```
(function(window,undefined) {
    // ...
})(window)
```

在这个函数中，我们没有向其传递第二参数（形参名叫 `undefined`），那么第二个参数的值就会被传递上 “未定义”，因此，通过这种方式，在该函数的作用域中所有的 `undefined` 都为受信的 `undefined`。

参考资料
--------

[MDN: undefined](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/undefined)

[MDN: void](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/void)
