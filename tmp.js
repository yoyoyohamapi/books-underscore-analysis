var collectNonEnumProps = function (obj, keys) {
    var nonEnumIdx = nonEnumerableProps.length;
    // 通过对象构造函数获得对象的原型
    var constructor = obj.constructor;
    // 如果构造函数合法，且具有`prototype`属性，那么`prototype`就是该obj的原型
    // 否则默认obj的原型为Object.prototype
    var proto = _.isFunction(constructor) && constructor.prototype || ObjProto;

    // 如果对象有constructors属性，且当前的属性集合不存在构造函数这一属性
    var prop = 'constructor';
    // 需要将constructor属性添加到属性集合中
    if (_.has(obj, prop) && !_.contains(keys, prop)) keys.push(prop);

    // 将不可枚举的属性也添加到属性集合中
    while (nonEnumIdx--) {
        prop = nonEnumerableProps[nonEnumIdx];
        // 注意，添加的属性只能是自有属性 （obj[prop] !== proto[prop]）
        if (prop in obj && obj[prop] !== proto[prop] && !_.contains(keys, prop)) {
            keys.push(prop);
        }
    }
};
