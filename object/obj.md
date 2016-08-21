## Object(obj)
在underscore对象api中，很多函数内部都可以见到下面的一段代码：
```js
var obj = Object(obj);
```

这段代码的意义是：
- 如果`obj`是一个对象，那么`Object(obj)`返回`obj`
- 如果`obj`是undefined或null，那么`Object(obj)`返回一个`{}`
- 如果`obj`是一个原始值(Primitive value)，那么`Object(obj)`返回一个被包裹的原始值:
```js
var obj = 2;
obj = Object(obj); // 相当于new Number(obj);
// => obj: Number {[[PrimitiveValue]]: 2}
var value = obj.valueOf();
// => value: 2
```

一言以蔽之，`Object(obj)`就是将传入`obj`进行对象化
