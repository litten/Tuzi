/**
 * @fileoverview javascript小兔子，不对，小库子…
 * @version 1.0
 * @author litten tengfeiok@gmail.com
 * @lastUpdate 2012-11-1 21:30 
 */

 /**
 * @description Tuzi原型，可自由拓展
 */
var _tuzi_prototype = {
	tuzi: true
};
 /**
 * @description 选择器，提供多种类jquery选择器
 */
var _tuzi_selector = (function(){
    var exprClassName = /^(?:[\w\-]+)?\.([\w\-]+)/,
        exprId = /^(?:[\w\-]+)?#([\w\-]+)/,
        exprNodeName = /^([\w\*\-]+)/,
		exprNodeAttr = /^(?:[\w\-]+)?\[([\w]+)(=(\w+))?\]/,
        na = [null,null, null, null];
    
    function _find(selector, context) {
        context = context || document;
        var simple = /^[\w\-#]+$/.test(selector);
        if (!simple && context.querySelectorAll) {
			if(context.nodeType == 1){
				var old = context.id, id = context.id = "__como__";
				try {
					return realArray(context.querySelectorAll( "#" + id + " " + selector ));
				} catch(e) {
				} finally {
					if ( old ) {
						context.id = old;
					} else {
						context.removeAttribute( "id" );
					}
				}
			}
			return realArray(context.querySelectorAll( selector ));          
        }
        if (selector.indexOf(',') > -1) {
            var split = selector.split(/,/g), ret = [], sIndex = 0, len = split.length;
            for(; sIndex < len; ++sIndex) {
                ret = ret.concat( _find(split[sIndex], context) );
            }
            return unique(ret);
        }
        selector = selector.replace(' > ', '>').replace('>', ' > ');
        var  parts = selector.split(/ /g),
            part = parts.pop(),
            id = (part.match(exprId) || na)[1],
            className = !id && (part.match(exprClassName) || na)[1],
            nodeName = !id && (part.match(exprNodeName) || na)[1],
			_attr = part.match(exprNodeAttr) || na,
			attrName = _attr[1] || null,
			attrValue =  _attr[3] || null,
			collection = !id && realArray(context.getElementsByTagName(nodeName || '*'));

        if (className) {
            collection = filterByAttr(collection, 'className', className);
        }
		if(attrName){
			collection = filterByAttr(collection, attrName, attrValue);
		}
        if (id) {
            var byId = context.getElementById(id);
            return byId?[byId]:[];
        }
     
        return parts[0] && collection[0] ? filterParents(parts, collection) : collection;
    }
    
    function realArray(c) {
        try {
            return Array.prototype.slice.call(c);
        } catch(e) {
            var ret = [], i = 0, len = c.length;
            for (; i < len; ++i) {
                ret[i] = c[i];
            }
            return ret;
        }
    }
    
    function filterParents(selectorParts, collection, direct) {
        var parentSelector = selectorParts.pop();
        if (parentSelector === '>') {
            return filterParents(selectorParts, collection, true);
        }
        var ret = [],
            r = -1,
            id = (parentSelector.match(exprId) || na)[1],
            className = !id && (parentSelector.match(exprClassName) || na)[1],
            nodeName = !id && (parentSelector.match(exprNodeName) || na)[1],
            cIndex = -1,
            node, parent,
            matches;
        nodeName = nodeName && nodeName.toLowerCase();
        while ( (node = collection[++cIndex]) ) {
            parent = node.parentNode;
            do {
                matches = !nodeName || nodeName === '*' || nodeName === parent.nodeName.toLowerCase();
                matches = matches && (!id || parent.id === id);
                matches = matches && (!className || RegExp('(^|\\s)' + className + '(\\s|$)').test(parent.className));
                if (direct || matches) { break; }
            } while ( (parent = parent.parentNode) );
            if (matches) {
                ret[++r] = node;
            }
        }
        return selectorParts[0] && ret[0] ? filterParents(selectorParts, ret) : ret;
    }
    
    var unique = function(){
        var uid = +new Date();
        var data = function(){
            var n = 1;
            return function(elem) {
                var cacheIndex = elem[uid],
                    nextCacheIndex = n++;
                if(!cacheIndex) {
                    elem[uid] = nextCacheIndex;
                    return true;
                }
                return false;
            };
        }();
        return function(arr) {
            var length = arr.length,
                ret = [],
                r = -1,
                i = 0,
                item;
            for (; i < length; ++i) {
                item = arr[i];
                if (data(item)) {
                    ret[++r] = item;
                }
            }
            uid += 1;
            return ret;
        };
    }();
    
    function filterByAttr(collection, attr, value) {
		var reg = RegExp('(^|\\s)' + value + '(\\s|$)');
		var test = function(node){
			var v = attr == 'className' ? node.className : node.getAttribute(attr);
			if(v){
				if(value){
					if(reg.test(v)) return true;
				} else {
					return true;
				}
			}
			return false;
		};
        var i = -1, node, r = -1, ret = [];
        while ( (node = collection[++i]) ) {
            if (test(node)) {
                ret[++r] = node;
            }
        }
        return ret;
    }
    return _find;
})();
 /**
 * @description 选择器，调用_tuzi_selector函数
 * @param {String} selector
 * @param {String} context
 */
var _find = function(selector, context){
	if(selector == null) return [];
	if(selector instanceof Array){
		return selector;
	} else {
		if(typeof selector == 'object'){
			if(selector.nodeType){
				return [selector];
			} else if(selector.size){
				return selector;
			} else {
				return [selector];
			}
		} else {
			if(typeof selector != 'string'){ return []; }
			else{
				if(context && context.size && context.length) context = context[0];
				return _tuzi_selector(selector, context);
			}
		}
	}
};
 /**
 * @description 扩展器，将选择器返回数组拓展为Tuzi对象
 * @param {String} target
 * @param {String} src
 */
var _extend = function (target,src) {
	for (var it in src) {
		target[it] = src[it];
	}
	return target;
}
 /**
 * @description 基础方法
 * @param {String | Object} selector dom元素的id，或者dom元素
 * @param {String} context
 */
var Tuzi = window.Tuzi = function(selector, context){
	var result = _find(selector, context);
	if(result.length){
		_extend(result, _tuzi_prototype);
		return result;
	} 
	return null;
};
window.$ = Tuzi;

Tuzi.Show = {
}

Tuzi.Section = {
    create: function(){
        var dSection = document.createElement('section');
        
    }
}

Tuzi.Stage = {
    init:function(){
        this.bringCss();
        this.create();
    },
    bringCss:function(){
        var dLink = document.createElement('link');
        dLink.rel = "stylesheet";
        dLink.href = "tuzi.css";
        document.getElementsByTagName('head')[0].appendChild(dLink);
    },
    create:function(){
        var dDiv = document.createElement('div');
        dDiv.className = "tuzi_stage";
        document.getElementsByTagName('body')[0].appendChild(dDiv);
    }
}
Tuzi.Stage.init();
