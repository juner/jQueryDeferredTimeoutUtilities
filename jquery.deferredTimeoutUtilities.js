;(function ($,w,undefined) {
    "use strict";
    /** 
     * 時間管理時のDeferred実装用Deferredオブジェクト
     * @typedef jQueryTimeDeferred
     * @type {jQuery.Deferred}
     * @property {Function} clear タイマーをキャンセルさせる為のメソッド
     */
    /**
     * setInterval の Deferred 実装
     * $.dInterval(time) の様に呼び出す。
     * 戻り値は Promise で、 関数として .clear() が追加されている。
     * .done - 未使用
     * .fail - 関数 .clear() を実行することにより呼ばれる
     * .progress - timeミリ秒ごとに呼ばれる
     * $.dInterval(time) では コールバックのthis に null が入るのに対して
     * $(sel).dInterval(time) では コールバックの this に 選択設定した要素が入る。（画面上に存在しているかは非保証)
     * @param {!Number} [time] time秒毎に繰り返す時間 (ms)
     * @return {jQueryTimeDeferred} 
     */var _d_i=0
    var dInterval = function (time) {
        var self = this,
            d = $.Deferred(),
            key = w.setInterval(function () {
                d.notifyWith(self);
            }, time),
            p = d.promise();
        p.clear = function () {
            w.clearInterval(key);
            d.rejectWith(self);
        };
        return p;
    };
    /**
     * setTimeout の Deferred 実装
     * $.dTimeout(time) の様に呼び出す。
     * 戻り値は Promise で、 関数として .clear() が追加されている。
     * .done - timeミリ秒経過して余裕があれば呼ばれる（余裕が無ければ余裕があるタイミングで呼ばれる）
     * .fail - 関数 .clear() を実行することにより呼ばれる
     * .progress - 未使用
     * $.dTimeout(time) では コールバックのthis に null が入るのに対して
     * $(sel).dTimeout(time) では コールバックの this に 選択設定した要素が入る。（画面上に存在しているかは非保証)
     * @param {Number} [time] time秒後に呼び出す予定の時間 (ms)
     * @return {jQueryTimeDeferred}
     */
    var dTimeout = function (time) {
        var self = this,
            d = $.Deferred(),
            key = w.setTimeout(function () {
                d.resolveWith(self);
            }, time),
            p = d.promise();
        p.clear = function () {
            w.clearTimeout(key);
            d.rejectWith(self);
        };
        return p;
    };
    
    /**
     * setInterval による .dTimeout() 実装
     * $.dIntervalTimeout(time) の様に呼び出す。
     * 戻り値は Promise で、 関数として .clear() が追加されている。
     * .done - timeミリ秒経過して余裕があれば呼ばれる（余裕が無ければ余裕があるタイミングで呼ばれる）
     * .fail - 関数 .clear() を実行することにより呼ばれる
     * .progress - 未使用
     * $.dIntervalTimeout(time) では コールバックのthis に null が入るのに対して
     * $(sel).dIntervalTimeout(time) では コールバックの this に 選択設定した要素が入る。（画面上に存在しているかは非保証)
     * @param {Number} [time] time秒後に呼び出す予定の時間 (ms)
     * @return {jQueryTimeDeferred}
     */
    var dIntervalTimeout = function (time) {
        var self = this,
            d = $.Deferred(),
            key = w.setInterval(function () {
                if(key != null){
                    w.clearInterval(key);
                    d.resolveWith(self);
                    key = null;
                }
            }, time),
            p = d.promise();
        p.clear = function () {
            w.clearInterval(key);
            d.rejectWith(self);
            key = null;
        };
        return p;
    };
    /**
     * setTimeout() による .dInterval() の実装。
     * $.dTimeoutInterval() の様に呼び出す。
     * 戻り値は Promise で、 関数として .clear() が追加されている。
     * .done - 未使用
     * .fail - 関数 .clear() を実行することにより呼ばれる
     * .progress - timeミリ秒ごとに呼ばれる
     * $.dTimeoutInterval(time) では コールバックのthis に null が入るのに対して
     * $(sel).tInterval(time) では コールバックの this に 選択設定した要素が入る。（画面上に存在しているかは非保証)
     * @param {!Number} [time] time秒毎に繰り返す時間 (ms)
     * @return {jQueryTimeDeferred} 
     */
    var dTimeoutInterval = function (time) {
        var self = this,
            d = $.Deferred(),
            func,
            key = w.setTimeout(func = function () {
                if(key != null){
                    d.notifyWith(self);
                    w.setTimeout(func,time);
                }
            }, time),
            p = d.promise();
        p.clear = function () {
            w.clearTimeout(key);
            d.rejectWith(self);
            key = null;
        };
        return p;
    };
    
    // 各ブラウザ対応
    w.requestAnimationFrame = (function(){
        return w.requestAnimationFrame		||
            w.webkitRequestAnimationFrame	||
            w.mozRequestAnimationFrame		||
            w.oRequestAnimationFrame		||
            w.msRequestAnimationFrame		||
            function(callback, element){
                var c=callback;
                return w.setTimeout(function(){
                    c.call(null,(new Date).getTime ());
                }, 1000 / 60);
            };
    })();
    w.cancelAnimationFrame = (function(){
        return w.cancelAnimationFrame       ||
            w.webkitCancelAnimationFrame    ||
            w.mozCancelAnimationFrame       ||
            w.oCancelAnimationFrame	        ||
            w.msCancelAnimationFrame        ||
            w.clearTimeout
    })();
    /**
     * requestAnimationFrame を利用した.dTimeout()を実行する。
     * @param {Number} [time] 実行する最低タイミング(ms)
     * @return {jQueryTimeDeferred}
     */
    var dFrameTimeout = function(time){
        if(typeof time !== "number"){
            time = -1;
        }
        var self = this,
            d = $.Deferred(),
            startTime = (new Date).getTime(),
            fnc,
            key = w.requestAnimationFrame(fnc = function (timestamp) {
                if(time < (new Date).getTime() - startTime){
                    d.resolveWith(self,[timestamp]);
                }else{
                    key = w.requestAnimationFrame(fnc);
                }
            }),
            p = d.promise();
        p.clear = function () {
            w.cancelAnimationFrame(key);
            d.rejectWith(self);
        };
        return p;
    }
    
    /**
     * requestAnimationFrame を利用した.dIntervalを実行する。
     * @param {Number} [time] 実行する最低間隔(ms)
     * @return {jQueryTimeDeferred}
     */
    var dFrameInterval = function(time){
       if(typeof time !== "number"){
            time = -1;
        }
        var self = this,
            d = $.Deferred(),
            startTime = (new Date).getTime(),
            t,
            fnc,
            key = w.requestAnimationFrame(fnc = function (timestamp) {
                if(key != null){
                    if(time < (t = (new Date).getTime()) - startTime){
                        d.notifyWith(self,[timestamp]);
                        startTime = t;
                        key = w.requestAnimationFrame(fnc);
                    }else{
                        key = w.requestAnimationFrame(fnc);
                    }
                }
            }),
            p = d.promise();
        p.clear = function () {
            w.cancelAnimationFrame(key);
            key = null;
            d.rejectWith(self);
        };
        return p;
    }
    /**
     * @param {Number} [time]
     * @return {jQueryTimeDeferred}
     */
    $.dInterval = function (time) {
        return dInterval.apply(null,arguments);
    };
    /**
     * @param {Number} [time]
     * @return {jQueryTimeDeferred}
     */
    $.fn.dInterval = function (time) {
        return dInterval.apply(this, arguments);
    };
    /**
     * @param {Number} [time]
     * @return {jQueryTimeDeferred}
     */
    $.dTimeoutInterval = function (time) {
        return dTimeoutInterval.apply(null,arguments);
    };
    /**
     * @param {Number} [time]
     * @return {jQueryTimeDeferred}
     */
    $.fn.dTimeoutInterval = function (time) {
        return dTimeoutInterval.apply(this, arguments);
    };
    /**
     * @param {Number} [time]
     * @return {jQueryTimeDeferred}
     */
    $.dTimeout = function (time) {
        return dTimeout.apply(null, arguments);
    };
    /**
     * @param {Number} [time]
     * @return {jQueryTimeDeferred}
     */
    $.fn.dTimeout = function (time) {
        return dTimeout.apply(this,arguments);
    };
    /**
     * @param {Number} [time]
     * @return {jQueryTimeDeferred}
     */
    $.dIntervalTimeout = function (time) {
        return dIntervalTimeout.apply(null, arguments);
    };
    /**
     * @param {Number} [time]
     * @return {jQueryTimeDeferred}
     */
    $.fn.dIntervalTimeout = function (time) {
        return dIntervalTimeout.apply(this,arguments);
    };
    /**
     * @param {Number} [time]
     * @return {jQueryTimeDeferred}
     */
    $.dFrameTimeout = function(){
        return dFrameTimeout.apply(null,arguments);
    };
    /**
     * @param {Number} [time]
     * @return {jQueryTimeDeferred}
     */
    $.fn.dFrameTimeout = function(){
        return dFrameTimeout.apply(this,arguments);
    };
        /**
     * @param {Number} [time]
     * @return {jQueryTimeDeferred}
     */
    $.dFrameInterval = function(){
        return dFrameInterval.apply(null,arguments);
    };
    /**
     * @param {Number} [time]
     * @return {jQueryTimeDeferred}
     */
    $.fn.dFrameInterval = function(){
        return dFrameInterval.apply(this,arguments);
    };
    /**
     * eachのDeferred実装
     * @param {Array|Object} arry 配列もしくは連想配列
     * @param {Number} [time] 時間。指定しない場合は時間にundefinedを指定したものと同じ状態になる
     * @param {Function} fn 第一引数に key,第二引数にvalueを持つ関数 戻り値にはboolean とDeferredを使用することが出来る
     * @param {tdf} [timeDeferredFunction] 時間を第一引数に取りDeferredにclearを持つ関数
     * @return {jQueryTimeDeferred}
     */
    $.dEach = function(arry,time,fn,tdf){
        arry = arry || [];
        if($.isFunction(time)){
            tdf = fn;
            fn = time;
            time = undefined;
        }
        if(!tdf || !$.isFunction(tdf)){
            tdf = $.dTimeout;
        }
        if(!$.isFunction(fn)){
            return $.Deferred().resolve();
        }
        arry = $.map(arry,function(v,k){ return {v:v,k:k}; });
        var c = $.noop;
        var clear = function(){
            c.apply();
        }
        var p = (function loop(){
            var arg = arguments,
                a = Array.prototype.shift.apply(arg);
            if(a === undefined){
                return $.Deferred().resolve();
            }
            var d = tdf(time);
            c = d.clear;
            return d.then(function(){
                    var result,d=$.Deferred().resolve();
                    if((result= fn.apply(a.v,[a.k,a.v])) === false){
                        d = $.Deferred().reject();
                    }else if(result && $.isFunction(result.promise)){
                        d = result;
                    }
                    return d.then(function(){
                        return loop.apply(null,arg);
                    });
                });
        }).apply(null,arry)
            .promise();
        p.clear = clear;
        return p;
    };
    $.fn.dEach = function(time,fn,tdf){
        return $.dEach(this,time,fn,tdf);
    }
})(jQuery,window);