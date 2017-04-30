模拟一段 SQL
============

有过关系型数据库开发经验的同学一定不会对 SQL 语句陌生，看一条最熟悉的 SQL 语句

```sql
SELECT username, id FROM users where age<30 group by sex;
```

下面会分别通过**面向对象**的思维和**函数式编程**的思维来模拟上面语句。

面向对象（OO）
--------------

在面向对象的世界中，我们首先需要一个类，我们称之为 `SQL`，实例化 `SQL` 对象时，我们需要传递给他 `table` 表明需要操作的表。 并且，我们向该 “类” 的原型中添加 `where`，`select` 等方法，为了方便，我们还支持到链式调用:

```js
function SQL(table){
    this.table = table;
    this._result = null;
    this._getRows = function() {
      return this._result?this._result: this.table;
    }

    this._doSelect = function(rows, keys) {
      return rows.map(function(row) {
        return _.keys(row).reduce(function(elem, key) {
          if (_.indexOf(keys, key) > -1) {
            elem[key] = row[key];
          }
          return elem;
        }, {});
      });
    }
}


// 投影
SQL.prototype.select = function(keys) {
  var rows =  this._getRows();
  if (_.isArray(rows)){
    this._result = this._doSelect(rows, keys);
  } else if(_.isObject(rows)) {
    this._result = _.keys(rows).map(function(key){
      return this._doSelect(rows[key], keys);
    });
  }
  return this;
}

// 限定, 这里偷点懒，我们还是用到了高阶函数
// 直接传递字符串进行parse太复杂
SQL.prototype.where = function(predicate) {
  var rows = this._getRows();
  if (_.isArray(rows)) {
    this._result =  rows.filter(predicate);
  } else if(_.isObject(rows)) {
    this._result = _.keys(rows).reduce(function(groups, group){
      groups[group] = rows[group].filter(predicate);
      return groups;
    }, {});
  }
  return this;
}

// 分组
SQL.prototype.groupBy = function(key) {
  var rows = this._getRows();
  this._result = rows.reduce(function(groups, row){
    // 获得当前key对应的值，如果分组中不存在，则新建
    var group = row[key];
    if(!groups[group]) {
      groups[group] = [];
    }
    groups[group].push(row);
    return groups;
  }, {});
  return this;
}

// 获得结果
SQL.prototye.getResult = function() {
  return this._result;
}

```

**用例**：

```js
var users = [
  {id: 0, name: 'wxj', age: 18, sex: 'male'},
  {id: 1, name: 'john', age: 28, sex: 'male'},
  {id: 2, name: 'bob', age: 33, sex: 'male'},
  {id: 3, name: 'tom', age: 22, sex: 'male'},
  {id: 4, name: 'alice', age: 18, sex: 'female'},
  {id: 5, name: 'rihana', age: 35, sex: 'female'},
  {id: 6, name: 'sara', age: 20, sex: 'female'}
];

var sql = new SQL(users);

var predicate = function(row) {
  return row.age<30;
}

var result = sql.groupBy('sex').where(predicate).select(['username', 'id']).getResult();
// => result:
//{
//  male: [
//    {id: 0, name: 'wxj', age: 18, sex: 'male'},
//    {id: 1, name: 'john', age: 28, sex: 'male'},
//    {id: 3, name: 'tom', age: 22, sex: 'male'}
//  ],
//  famale: [
//    {id: 4, name: 'alice', age: 18, sex: 'female'},
//    {id: 6, name: 'sara', age: 20, sex: 'female'}
//  ]
//}
```

函数式（FP）
------------

可以看到，在面向对象的抽象中，我们为了做一个查询，却造了太多不需要的东西，比如 “类”，比如实例化对象的过程。同时，因为我们将 `table` 保存为对象的成员（可以视作需要维护的内部状态），且成员方法都存在着改变 `table` 的可能，所以就导致了我们的成员方法不是[ **纯函数** ](https://zh.wikipedia.org/wiki/%E7%BA%AF%E5%87%BD%E6%95%B0)（输入一定，则输出一定的函数），也就导致这些成员方法难于测试。

因而，我们将该用函数的眼光来抽象 `where`、`groupBy`、`select`等过程，使得各自无关，并且保持纯度：

```js
// 限定
function where(rows, predicate) {
  if (_.isArray(rows)) {
    return rows.filter(predicate);
  } else if(_.isObject(rows)) {
    return _.keys(rows).reduce(function(groups, group){
      groups[group] = rows[group].filter(predicate);
      return groups;
    }, {});
  } else {
    return rows;
  }
}

// 分组
function groupBy(rows, key) {
  return rows.reduce(function(groups, row){
    // 获得当前key对应的值，如果分组中不存在，则新建
    var group = row[key];
    if(!groups[group]) {
      groups[group] = [];
    }
    groups[group].push(row);
    return groups;
  }, {});
}

function doSelect(rows, keys) {
  return rows.map(function(row) {
    return _.keys(row).reduce(function(elem, key) {
      if (_.indexOf(keys, key) > -1) {
        elem[key] = row[key];
      }
      return elem;
    }, {});
  });
}

// 投影
function select(rows, keys) {
  if (_.isArray(rows)){
    return doSelect(rows, keys);
  } else if(_.isObject(rows)) {
    return _.keys(rows).map(function(key){
      return doSelect(rows[key], keys);
    });
  } else {
    return rows;
  }
}
```

我们还可以整合这三个方法为一个查询方法：

```js
function query(table, by, predicate, keys) {
  return select(where(groupBy(table, by), predicate), keys);
}
```

现在，完成类似查询时，我们不再需要实例化对象，并且 `query` 也保持了纯度：

```js
var users = [
  {id: 0, name: 'wxj', age: 18, sex: 'male'},
  {id: 1, name: 'john', age: 28, sex: 'male'},
  {id: 2, name: 'bob', age: 33, sex: 'male'},
  {id: 3, name: 'tom', age: 22, sex: 'male'},
  {id: 4, name: 'alice', age: 18, sex: 'female'},
  {id: 5, name: 'rihana', age: 35, sex: 'female'},
  {id: 6, name: 'sara', age: 20, sex: 'female'}
];

var predicate = function(elem) {
  return elem.age < 30;
};

var result = query(users, 'sex', predicate, ['name', 'id']);
// => result:
//{
//  male: [
//    {id: 0, name: 'wxj', age: 18, sex: 'male'},
//    {id: 1, name: 'john', age: 28, sex: 'male'},
//    {id: 3, name: 'tom', age: 22, sex: 'male'}
//  ],
//  famale: [
//    {id: 4, name: 'alice', age: 18, sex: 'female'},
//    {id: 6, name: 'sara', age: 20, sex: 'female'}
//  ]
//}
```

underscore 中的实现
-------------------

`_.where`，`_.select`函数在前面的章节已有过相应介绍，故不再重复赘述。接下来我们将认识到以下API：

-	`_.groupBy`
-	`_.indexBy`
-	`_.countBy`
-	`_.partition`

这几个函数都由内部函数 `group` 所创建，所以我们首先看到该函数。

`group`
-------

内置函数 `group` 接受如下两个参数：

-	`behavior`：获得组别后的行为，即当确定一个分组后，在该分组上施加的行为
-	`partition`：是否是进行划分，即是否是将一个集合一分为二

```js
var group = function (behavior, partition) {
    // 返回一个分组函数
    return function (obj, iteratee, context) {
        // 分组结果初始化
        // 如果是进行划分(二分)的话, 则结果分为两个组
        var result = partition ? [[], []] : {};
        iteratee = cb(iteratee, context);
        _.each(obj, function (value, index) {
            // 根据`iteratee`计算得到分组组别key
            var key = iteratee(value, index, obj);
            // 获得组别后, 执行定义的行为
            behavior(result, value, key);
        });
        return result;
    };
};
```

`group` 将返回一个分组函数，其接受三个参数：

-	`obj`：待分组集合对象
-	`iteratee`：集合迭代器，同样会被内置函数 `cb` 优化
-	`context`：执行上下文

下面我们看一看各个由 `group` 所创建的分组函数。

`_.groupBy`：对集合按照指定的关键字进行分组
-------------------------------------------

当 `iteratee` 确定了一个分组后，`_.groupBy` 的行为是：

-	如果分组结果中存在该分组, 将元素追加进该分组
-	否则新创建一个分组, 并将元素放入

**源码**：

```js
_.groupBy = group(function (result, value, key) {
    if (_.has(result, key)) result[key].push(value); else result[key] = [value];
});

```

**用例**：

```js
_.groupBy([1.3, 2.1, 2.4], function(num){ return Math.floor(num); });
// => {1: [1.3], 2: [2.1, 2.4]}

_.groupBy(['one', 'two', 'three'], 'length');
// => {3: ["one", "two"], 5: ["three"]}
```

`_.indexBy`：对集合按照指定的关键字进行索引
-------------------------------------------

当 `iteratee` 确定了一个分组后，`_.indexBy` 的行为：

-	设置该分组（索引）的对象为当前元素

**源码**：

```js
_.indexBy = group(function (result, value, key) {
    result[key] = value;
});
```

**用例**：

```js
var students = [
  {name: 'wxj', age: 18},
  {name: 'john', age: 18},
  {name: 'alice': age: 23},
  {name: 'bob': age: 30}
];

_.indexBy(students, 'age');
// => {
//  '18': {name: 'john', age: 18},
//  '23': {name: 'alice': age: 23},
//  '30': {name: 'bob': age: 30}
//}
```

`_.countBy`：分别对分组进行计数
-------------------------------

当 `iteratee` 确定了一个分组后，`_.countBy` 的行为：

-	如果该分组已存在，则计数加一
-	否则开始计数

**源码**：

```js
_.countBy = group(function (result, value, key) {
    if (_.has(result, key)) result[key]++; else result[key] = 1;
});
```

**用例**：

```js
_.countBy([1, 2, 3, 4, 5], function(num) {
  return num % 2 == 0 ? 'even': 'odd';
});
// => {odd: 3, even: 2}
```

`_.partition`：将一个集合一分为二
---------------------------------

当 `iteratee` 确定了一个分组后，`_.partion` 的行为：

-	将元素放入对应分组

**源码**：

```js
_.partition = group(function (result, value, pass) {
    // 分组后的行为,
    result[pass ? 0 : 1].push(value);
}, true);
```

**用例**：

```js
_.partition([0, 1, 2, 3, 4, 5], function(num){
  return num%2 !== 0;
});
// => [[1, 3, 5], [0, 2, 4]]
```
