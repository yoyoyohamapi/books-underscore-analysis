## 模拟一段sql
有过关系型数据库开发经验的同学一定不会对SQL语句陌生，看一条最熟悉的SQL语句
```sql
SELECT username, id FROM users where age<30 group by sex;
```

下面会分别通过__面向对象__的思维和__函数式编程__的思维来模拟上面语句。

### 面向对象
在面向对象的世界中，我们首先需要一个类，我们称之为`SQL`，他维护一个私有变量`table`，表明其要操作的表， 同时，我们向该“类”的原型中添加`where`，`select`等方法，为了方便，我们还支持到链式调用:
```js
function SQL(table){
    this.table = table;
    this.groups = {};
}

// 投影
SQL.prototype.select = function(keys) {
  this.tables = this.tables.map(function(row){
    keys.map()
  });
  return this;
}

// 限定, 这里偷点懒，我们还是用到了高阶函数
// 直接传递字符串进行parse太复杂
SQL.prototype.where = function(predicate) {
  this.tables = this.table.filter(predicate);
  return this;
}

// 分组
SQL.prototype.groupBy = function(key) {
  this.groups = this.tables.reduce(function(gourps,row){
    if(!gourps[key]) {
      groups[key] = [];
    }
    groups[key].push(row)
    return groups;
  }, {});
}

```

__用例__：
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
var result = sql.groupBy('sex').where(predicate).select(['username', 'id']);
```

### 函数式
我们同样会定义`where`，`groupBy`， `select`等函数，只是他们现在各自无关，且都是[纯函数](https://zh.wikipedia.org/wiki/%E7%BA%AF%E5%87%BD%E6%95%B0)（输入一定，则输出一定的函数）：
```js
// 限定
function where(rows, predicate) {
  if (_.isArray(rows)) {
    return rows.filter(predicate);
  } else if(_.isObject(rows)) {
    return _.keys(rows).reduce(function(groups, group){
      if(!groups[group]){
        groups[group] = [];
      }
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

// 投影
function select(rows, keys) {
  if (_.isArray(rows){
     return rows.map(function(row){
        return _.keys(row).reduce(function(elem, key){
          if(_.indexOf(keys, key)){
            elem[key] = row[key];
          }
          return elem;
        }. {});
      });
   } else if(_.isObject(rows)) {
     return _.keys(rows).reduce(function(groups, key){
         if(!groups[key]){
        groups[key] = [];
      }
      var row = rows[key];
      groups[key] = rows.map(function(row){
        return _.keys(row).reduce(function(elem, key){
          if(_.indexOf(keys, key)){
            elem[key] = row[key];
          }
          return elem;
        }. {});
      });
      return groups;
     }, {});
   } else {
     return rows;
   } 
}
```

现在，完成类似查询时，我们不再需要实例化对象：
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

var ret = select(where(groupBy(users)));
```

甚至，我们可以利用到函数式编程中的[函数组合](https://llh911001.gitbooks.io/mostly-adequate-guide-chinese/content/ch5.html)（compose）的概念来对上面查询过程做一个抽象：
```js
function compose() {

}

function query() {
  
}
```

