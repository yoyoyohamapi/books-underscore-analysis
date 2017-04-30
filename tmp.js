// 测试一般函数绑定
function add(a, b) {
    var result = a + b;
    console.log(this.name + ' wanna get add result:' + result);
}

var obj = {
    name: 'wxj'
};

var bound = _.bind(add, obj, 3, 4);
bound();
// => "wxj wanna get add result:7"

// 测试绑定函数作为构造函数使用
function constructor() {
    console.log('my name is:' + this.name);
}

var Person = _.bind(constructor, obj);
// 一般函数使用
Person();
// => "my name is wxj"

// 构造函数使用
var person = new Person();
