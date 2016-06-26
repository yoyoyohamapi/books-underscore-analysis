## map-reduce
### map，reduce是两个独立的过程
如果你有一定的js编程经历，那么你一定已经接触过`Array.prototype`提供的`map`和`reduce`函数。现在你需要明白的是，二者不仅仅是存在于js的两个API，更是函数式编程语言的重要组成部分，是一种对列表的操作思路。

map-reduce由如下两个独立的部分组成：
- __map（映射）__：一个映射过程就是将某个列表中的各个元素，__按照一定的规则__，逐个映射为新的元素，并构成的新的列表，这是一个__一一__对应的过程。用数学公式描述就是(其中，函数$$ f $$就是这个规则)：

$$
\left[ \begin{array}{c} newElem1 \\ newElem2 \\ newElem3 \\ ... \\ newElemN  \end{array} \right]\ = f(\left[  \begin{array}{c} elem1 \\ elem2 \\ elem3 \\ ... \\ elemN \end{array} \right]) 
$$

- __reduce （规约）__：一个规约过程仍然需要迭代指定列表的每个元素，然后仍然__按照一定规则__，合并这些元素到一个`目标对象`上。这是一个__由多至一__的过程，或者说是一个__逐步累积__的过程：
$$
newElem = f(\left[  \begin{array}{c} elem1 \\ elem2 \\ elem3 \\ ... \\ elemN \end{array} \right])
$$

### map在underscore中的实现
map的实现思路总体如下：
- 创建一个与原列表等长的列表
- 遍历原列表，用指定的函数`func`作用于每个遍历到元素，输出一个新的元素放入新列表
```js
_.map = _.collect = function (obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    // 同样,根据obj是对象还是数组分别考虑
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length,
        results = Array(length); // 定长初始化数组
    for (var index = 0; index < length; index++) {
        var currentKey = keys ? keys[index] : index;
        results[index] = iteratee(obj[currentKey], currentKey, obj);
    }
    return results;
};
```

使用用例：
1. 对数组使用`_.map`函数：
```js
var array = [1,2,3,4,5];
var doubledArray = _.map(array, function(elem, index, array){
    return 2*elem;
}); // => doubledArray: [2,4,6,8,10]
```
2. 对一般对象使用`_.map`函数：
```js
var obj = {
  name: 'wxj',
  age: 13,
  sex: 'male'
};
var wxjInfos = _.map(obj, function(value ,key, obj){
  return [key, value].join(':');
}); // wxjInfors => ['name:wxj', 'age:13', 'sex:male']
```


### reduce在underscore中的实现
相较于map，reduce函数在underscore中的实现更为复杂一些，因此，underscore而外撰写一个内部函数`createReducer`用来创建reduce。其思路大致如下：
- 区分reduce的方向`dir`，是从序列__开端__开始做规约过程，还是从序列__末端__开始做规约过程。
- 如果没有创建一个`memo`用以缓存当前当前的规约过程的结果
- 遍历当前集合，对最近迭代到的元素按传入的`func`进行规约操作，刷新`memo`
- 规约过程完成，返回`memo`
```js
 var createReduce = function (dir) {
      // Wrap code that reassigns argument variables in a separate function than
      // the one that accesses `arguments.length` to avoid a perf hit. (#1991)
      var reducer = function (obj, iteratee, memo, initial) {
          var keys = !isArrayLike(obj) && _.keys(obj),
              length = (keys || obj).length,
              index = dir > 0 ? 0 : length - 1;
          // 如果reduce没有初始化memo, 则默认为首个元素(从左开始则为第一个元素,从右则为最后一个元素)
          if (!initial) {
              memo = obj[keys ? keys[index] : index];
              index += dir;
          }
          for (; index >= 0 && index < length; index += dir) {
              var currentKey = keys ? keys[index] : index;
              // 执行reduce回调,刷新当前值
              memo = iteratee(memo, obj[currentKey], currentKey, obj);
          }
          return memo;
      };

      return function (obj, iteratee, memo, context) {
          // 如果参数正常,则代表已经初始化了memo
          var initial = arguments.length >= 3;
          // 所有的传入回调都要通过optimizeCb进行优化,
          // reducer因为引入了累加器,所以优化函数的第三个参数传入了4,
          // 这样, 新的迭代回调第一个参数就是当前的累加结果:
          // _.reduce([1,2,3],function(prev,current){})
          return reducer(obj, optimizeCb(iteratee, context, 4), memo, initial);
      };
  };
```

使用用例：
1. 对数组使用`_.reduce`
```js
var array = [1,2,3,4,5];
var sum = _.reduce(array, function(prev, current){
  return prev+current;
} ,0);
// sum: 15
```
2. 一般对象也可以进行`_.reduce`
```js
var scores = {
  english: 93,
  math: 88,
  chinese: 100
};
var total = _.reduce(scores, function(prev, value, key){
  return prev+value;
}, 0);
// => total: 281
```
