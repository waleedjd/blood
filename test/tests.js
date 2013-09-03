(function(root) {
    var aok = root.aok
      , blood = root.blood
      , OP = Object.prototype;
    
    /*function testList(method, subject) {
        var arr = method(subject), msg = ' (length: ' + arr.length  + ')';
        this.fail += msg;
        this.pass += msg;
        return arr.length;
    }*/

    aok.prototype.express = aok.info;
    aok({
        id: 'keys'
      , test: 'a' === blood.keys({a:1}).pop() && 0 === blood.keys(OP).length
    });
    aok({
        id: 'create'
      , test: blood.every([null, {a:1}], function(parent) {
            var child = blood.create(parent);
            return !!child && !blood.keys(child).length && blood.line(child) === parent;
        })
    });
    aok({
        id: 'arrProps'
      , test: function() {
            var arr = blood.props([]);
            this.remark = 'length: ' + arr.length;
            return arr.length;
        }
    });
    aok({
        id: 'objProps'
      , test: function() {
            var arr = blood.props({'length':1}), msg = ' (length: ' + arr.length  + ')';
            this.fail += msg;
            this.pass += msg;
            return arr.length;
        }
    });
    aok({
        id: 'funProps', test: function() {
            var arr = blood.props(isFinite), msg = ' (length: ' + arr.length  + ')';
            this.fail += msg;
            this.pass += msg;
            return arr.length;
        }
    });
    aok({
        id: 'tree'
      , test: function() {
            var r, a = {id:'a'}, b = blood.create(a), c = blood.create(b);
            b.id = 'b';
            c.id = 'c';
            r = blood.tree(c);
            return 4 === r.length && c === r[0] && b === r[1] && a === r[2] && OP === r[3];
        }
    });
    aok({
        id: 'map'
      , test: function() {
            var list = [0, 1, 2, 3, 4];
            return '11111' === blood.map(list, function(n, i, o) {
                return this === list && o === list && n == i ? 1 : 0;
            }, list).join('');
        }
    });
    aok({
        id: 'collect'
      , test: function() {
            var list = {0:0, 1:1, 2:2, 3:3, 4:4};
            return '11111' === blood.collect(list, function(n, i, o) {
                return this === list && o === list && n == i ? 1 : 0;
            }, list).join('');
        }
    });
    aok({
        id: 'pluck'
      , test: function() {
            var list = [{a:0, b:1}, {a:2, b:3}, {a:4, b:5}];
            return '135' === blood.pluck(list, 'b').join('');
        }
    });
}(this));