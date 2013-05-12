/*!
 * blood        inheritance module
 * @link        github.com/ryanve/blood
 * @license     MIT
 * @copyright   2013 Ryan Van Etten
 * @version     0.3.0
 */

/*jshint expr:true, laxcomma:true, sub:true, supernew:true, debug:true, node:true, boss:true, evil:true, 
  undef:true, eqnull:true, unused:true, browser:true, devel:true, jquery:true, indent:4, maxerr:100 */

(function(root, name, make) {
    typeof module != 'undefined' && module['exports'] ? module['exports'] = make() : root[name] = make();
}(this, 'blood', function() {

    var AP = Array.prototype
      , OP = Object.prototype
      , owns = OP['hasOwnProperty']
      , push = AP['push']
      , slice = AP['slice']
      , concat = AP['concat']
      , indexOf = AP['indexOf'] || function(needle, i) {
            var l = this.length;
            i >>= 0; // toInteger
            for (i = 0 > i ? l + i : i; i < l; i++) {
                if (i in this && this[i] === needle)
                    return i;
            }
            return -1;
        }
        
        // stackoverflow.com/a/3705407/770127
        // developer.mozilla.org/en-US/docs/ECMAScript_DontEnum_attribute
      , hasEnumBug = !{'valueOf': 1}['propertyIsEnumerable']('valueOf') // IE8-
      , dontEnums = [
            'constructor'
          , 'propertyIsEnumerable'
          , 'valueOf'
          , 'toString'
          , 'toLocaleString'
          , 'isProtoypeOf'
          , 'hasOwnProperty'
        ]
        
        /**
         * @param  {*}             ob
         * @param  {string|number} key
         * @return {boolean}
         */
      , has = function(ob, key) {
            return owns.call(ob, key);
        }

      , keys = !hasEnumBug && Object.keys || function(ob) {
            var k, i, list = [], others = dontEnums;
            for (k in ob) {
                has(ob, k) && '__proto__' !== k && list.push(k);
            }
            for (i = others.length; i--;) {
                has(ob, k = others[i]) && !~indexOf.call(list, k) && list.push(k);
            }
            return list;
        }
        
      , getPro = Object.getPrototypeOf || function(ob) {
            return void 0 !== ob['__proto__'] ? ob['__proto__'] : (ob.constructor || Object).prototype; 
        }

      , setPro = function(ob, pro) {
            // experimental
            ob['__proto__'] = pro;
            return ob;
        }
        
      , nativeCreate = (function(oCreate) {
            try {
                // Object.create(null) should inherit no properties.
                // Object.create(func) should inherit from Function.
                if (!oCreate(null)['valueOf'] && oCreate.call === oCreate(oCreate).call)
                    return oCreate; // Return reference if implementation seems proper.
            } catch (e) {}
        }(Object.create))

      , create = nativeCreate || (function(dontEnums) {
            
            // Fallback adapted from the ES5 shim (github.com/kriskowal/es5-shim/pull/132)
            // {'__proto__': null} should inherit NO props. IE8- wrongly inherits Object.prototype.
            var hasNullBug = !!{'__proto__': null}['valueOf']
              , emptyProto = hasNullBug && (function(document) {
                    var emptyProto, parentNode, iframe;
                    parentNode = document.body || document.documentElement;
                    iframe = document.createElement('iframe');
                    iframe['style']['display'] = 'none';
                    parentNode.appendChild(iframe);
                    iframe['src'] = 'javascript:';
                    emptyProto = iframe.contentWindow.Object.prototype;
                    parentNode.removeChild(iframe);
                    iframe = null;
                    return (function(ob, list) {
                        var i = list.length;
                        while (i--) if (list[i] in ob) delete ob[list[i]];
                        return ob;
                    }(emptyProto, dontEnums));
                }(document));

            /**
             * @param  {Object|Array|Function|null}  parent
             * @return {Object}
             */
            return function(parent) {
                function F() {}
                var instance;
                null === parent ? (
                    hasNullBug ? F.prototype = emptyProto : instance = {'__proto__': null}
                ) : F.prototype = parent;
                instance = instance || new F; // inherits F.prototype
                instance['__proto__'] = parent; // help getPrototypeOf work in IE8-
                return instance;
            };
        }(dontEnums));

    /**
     * @param  {Object|Array|Function}          receiver
     * @param  {(Object|Array|Function)=}       supplier
     * @param  {(Array|string|number|boolean)=} list
     */
    function adopt(receiver, supplier, list) {
        var i = arguments.length, force = null != (false === list ? list = null : list);
        1 === i && (supplier = receiver, receiver = this);
        list = force && true !== list ? (typeof list != 'object' ? [list] : list) : keys(supplier);
        i = list.length;
        for (i = 0 < i && i; i--;) {
            if (force || !has(receiver, list[i]))
                receiver[list[i]] = supplier[list[i]];
        }
        return receiver;
    }

    /**
     * @param  {Object|Array|Function} receiver
     * @param  {Object|Array|Function} supplier
     */
    function assign(receiver, supplier) {
        // Functionally like the ES6 Object.assign expectation, plus single-`param syntax
        1 === arguments.length && (supplier = receiver, receiver = this);
        return adopt(receiver, supplier, keys(supplier));
    }
    
    /**
     * @param  {Object|Array|Function} ob
     * @param  {Object|null}           pro
     */
    function line(ob, pro) {
        return 2 == arguments.length ? setPro(ob, pro) : getPro(ob);
    }

    /**
     * @param  {Object}  source
     * @return {Object}
     */
    function orphan(source) {
        return source ? assign(create(null), source) : create(null);
    }

    /**
     * @param  {Object|Array|Function|null} source
     * @param  {(Object|null)=}             parent
     */
    function twin(source, parent) {
        var n = arguments.length;
        source = n ? source : this;
        parent = 2 == n ? parent : getPro(source);
        return assign(create(parent), source);
    }
    
    // Use .every/.some/.reduce for array-likes.
    // Use .all/.any/.inject for NON-array-likes.

    /**
     * @param  {Object|Function} ob
     * @param  {Function=}       fn
     * @param  {*=}              scope
     */
    function all(ob, fn, scope) {
        var list = keys(ob), l = list.length, i = 0;
        while (i < l) if (!fn.call(scope, ob[list[i]], list[i++], ob)) return false;
        return true;
    }
    
    /**
     * @param  {Object|Function} ob
     * @param  {Function=}       fn
     * @param  {*=}              scope
     */
    function any(ob, fn, scope) {
        var list = keys(ob), l = list.length, i = 0;
        while (i < l) if (fn.call(scope, ob[list[i]], list[i++], ob)) return true;
        return false;
    }
    
    /**
     * @param  {Object|Array} ob
     * @param  {Function=}    fn
     * @param  {*=}           scope
     */
    function every(ob, fn, scope) {
        var l = ob.length, i = 0;
        while (i < l) if (!fn.call(scope, ob[i], i++, ob)) return false;
        return true;
    }
    
    /**
     * @param  {Object|Array} ob
     * @param  {Function=}    fn
     * @param  {*=}           scope
     */
    function some(ob, fn, scope) {
        var l = ob.length, i = 0;
        while (i < l) if (fn.call(scope, ob[i], i++, ob)) return true;
        return false;
    }
    
    /**
     * @param  {Object|Array|Arguments} ob
     * @param  {Function}               accum
     * @param  {*=}                     value
     * @param  {*=}                     scope
     */
    function reduce(ob, accum, value, scope) {
        var i = 0, l = ob.length;
        value = 3 > arguments.length ? ob[i++] : value;
        while (i < l) value = accum.call(scope, value, ob[i], i++, ob);
        return value;
    }
    
    /**
     * @param  {Object|Function}        ob
     * @param  {Function}               accum
     * @param  {*=}                     value
     * @param  {*=}                     scope
     */
    function inject(ob, accum, value, scope) {
        var list = keys(ob), i = 0, l = list.length;
        value = 3 > arguments.length ? ob[list[i++]] : value;
        while (i < l) value = accum.call(scope, value, ob[list[i]], list[i++], ob);
        return value;
    }
    
    /**
     * @param  {*}  ob
     * @return {number}
     */
    function size(ob) {
        return null == ob ? 0 : (ob.length === +ob.length ? ob : keys(ob)).length; 
    }

    /**
     * @param  {Object|Array|Function} ob
     * @return {Array}
     */
    function values(ob) {
        var list = keys(ob), i = list.length;
        while (i--) list[i] = ob[list[i]];
        return list;
    }
    
    /**
     * @param  {Object|Array|Function} ob
     * @return {Array}
     */
    function pairs(ob) {
        var list = keys(ob), i = list.length;
        while (i--) list[i] = [list[i], ob[list[i]]];
        return list;
    }
    
    /**
     * @param  {Object|Array|Arguments} keys
     * @param  {Object|Array|Arguments} values
     * @param  {*=}                     target
     * @return {Object|*}
     */
    function combine(keys, values, target) {
        return some(keys, values ? function(n, i) {
            this[n] = values[i];
        } : function(pair) {
            this[pair[0]] = pair[1];
        }, target = target || {}), target;
    }
    
    /**
     * @param  {Object|Array|Arguments} ob
     * @return {Object}
     */
    function invert(ob) {
        // return combine(values(ob), keys(ob));
        return inject(ob, function(r, v, k) {
            r[v] = k;
        }, {});
    }
    
    function zip() {
        var r = [], args = arguments, i = 0, hasIndex = function(v) { return i in v; };
        while (some(args, hasIndex)) r.push(pluck(args, i++));
        return r;
    }
    
    /**
     * @param  {Object|Array|Function} ob
     * @param  {string|Array}          type
     * @return {Array}
     */
    function types(ob, type) {
        var names = keys(ob), i = names.length;
        type = typeof type != 'object' ? [type] : type;
        while (i--) ~indexOf.call(type, typeof ob[names[i]]) || names.splice(i, 1);
        return names.sort();
    }
    
    /**
     * @param  {Object|Array|Function} ob
     * @return {Array}
     */
    function methods(ob) {
        return types(ob, 'function');
    }
    
    /**
     * @param  {Object|Array|Function} source
     * @return {Object}
     */
    function pick(source) {
        return reduce(concat.apply(AP, slice.call(arguments, 1)), function(r, n) {
            n in source && (r[n] = source[n]);
            return r;
        }, {});
    }
    
    /**
     * @param  {Object|Array|Function} source
     * @return {Object}
     */
    function omit(source) {
        return inject(source, function(r, n) {
            ~indexOf.call(this, n) || (r[n] = source[n]);
            return r;
        }, {}, concat.apply(AP, slice.call(arguments, 1)));
    }
    
    function map(ob, fn, scope) {
        return (typeof ob != 'function' && ob.length === +ob.length ? reduce : inject)(ob, function(r, v, k, ob) {
            return r[k] = fn.call(scope, v, k, ob), r;
        }, []);
    }
    
    function pluck(ob, key) {
        return map(ob, function(v) {
            return v[key];
        });
    }
    
    /**
     * @param  {Object|Array} ob
     * @param  {*}            needle
     * @return {boolean}
     */
    function include(ob, needle) {
        // Emulate _.include (underscorejs.org/#contains)
        return !!~indexOf.call(ob.length === +ob.length ? ob : values(ob), needle);
    }
    
    /**
     * @param  {*}  a
     * @param  {*=} b
     * @return {boolean}
     */
    function same(a, b) {
        // Emulate ES6 Object.is
        return a === b ? (
            0 !== a || 1/a === 1/b  // Discern -0 from 0
        ) : a !== a && b !== b;     // NaN is non-reflexive
    }

    return {
        'adopt': adopt
      , 'all': all
      , 'any': any
      , 'assign': assign
      , 'create': create
      , 'has': has
      , 'include': include
      , 'inject': inject
      , 'invert': invert
      , 'keys': keys
      , 'line': line
      , 'map': map
      , 'methods': methods
      , 'object': combine
      , 'orphan': orphan
      , 'owns': owns
      , 'pairs': pairs
      , 'pluck': pluck
      , 'reduce': reduce
      , 'twin': twin
      , 'types': types
      , 'same': same
      , 'size': size
      , 'values': values
      , 'zip': zip
    };
}));