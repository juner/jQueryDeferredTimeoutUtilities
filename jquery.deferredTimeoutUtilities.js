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
     * $.deferredInterval(time) の様に呼び出す。
     * 戻り値は Promise で、 関数として .clear() が追加されている。
     * .done - 未使用
     * .fail - 関数 .clear() を実行することにより呼ばれる
     * .progress - timeミリ秒ごとに呼ばれる
     * $.deferredInterval(time) では コールバックのthis に null が入るのに対して
     * $(sel).deferredInterval(time) では コールバックの this に 選択設定した要素が入る。（画面上に存在しているかは非保証)
     * @param {!Number} [time] time秒毎に繰り返す時間 (ms)
     * @return {jQueryTimeDeferred} 
     */var _d_i=0
    var deferredInterval = function (time) {
        var self = this,
            d = $.Deferred(),
            key = w.setInterval(function () {
                d.notifyWith(self);
            }, time),
            p = d.promise();
        p.clear = function () {
            w.clearInterval(key);
            d.rejectWith(self,arguments);
        };
        return p;
    };
    /**
     * setTimeout の Deferred 実装
     * $.deferredTimeout(time) の様に呼び出す。
     * 戻り値は Promise で、 関数として .clear() が追加されている。
     * .done - timeミリ秒経過して余裕があれば呼ばれる（余裕が無ければ余裕があるタイミングで呼ばれる）
     * .fail - 関数 .clear() を実行することにより呼ばれる
     * .progress - 未使用
     * $.deferredTimeout(time) では コールバックのthis に null が入るのに対して
     * $(sel).deferredTimeout(time) では コールバックの this に 選択設定した要素が入る。（画面上に存在しているかは非保証)
     * @param {Number} [time] time秒後に呼び出す予定の時間 (ms)
     * @return {jQueryTimeDeferred}
     */
    var deferredTimeout = function (time) {
        var self = this,
            d = $.Deferred(),
            key = w.setTimeout(function () {
                d.resolveWith(self);
            }, time),
            p = d.promise();
        p.clear = function () {
            w.clearTimeout(key);
            d.rejectWith(self,arguments);
        };
        return p;
    };
    
    /**
     * setInterval による .deferredTimeout() 実装
     * $.deferredIntervalTimeout(time) の様に呼び出す。
     * 戻り値は Promise で、 関数として .clear() が追加されている。
     * .done - timeミリ秒経過して余裕があれば呼ばれる（余裕が無ければ余裕があるタイミングで呼ばれる）
     * .fail - 関数 .clear() を実行することにより呼ばれる
     * .progress - 未使用
     * $.deferredIntervalTimeout(time) では コールバックのthis に null が入るのに対して
     * $(sel).deferredIntervalTimeout(time) では コールバックの this に 選択設定した要素が入る。（画面上に存在しているかは非保証)
     * @param {Number} [time] time秒後に呼び出す予定の時間 (ms)
     * @return {jQueryTimeDeferred}
     */
    var deferredIntervalTimeout = function (time) {
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
            d.rejectWith(self,arguments);
            key = null;
        };
        return p;
    };
    /**
     * setTimeout() による .deferredInterval() の実装。
     * $.deferredTimeoutInterval() の様に呼び出す。
     * 戻り値は Promise で、 関数として .clear() が追加されている。
     * .done - 未使用
     * .fail - 関数 .clear() を実行することにより呼ばれる
     * .progress - timeミリ秒ごとに呼ばれる
     * $.deferredTimeoutInterval(time) では コールバックのthis に null が入るのに対して
     * $(sel).deferredTimeoutInterval(time) では コールバックの this に 選択設定した要素が入る。（画面上に存在しているかは非保証)
     * @param {!Number} [time] time秒毎に繰り返す時間 (ms)
     * @return {jQueryTimeDeferred} 
     */
    var deferredTimeoutInterval = function (time) {
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
            d.rejectWith(self,arguments);
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
     * requestAnimationFrame を利用した.deferredTimeout()を実行する。
     * @param {Number} [time] 実行する最低タイミング(ms)
     * @return {jQueryTimeDeferred}
     */
    var deferredFrameTimeout = function(time){
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
            d.rejectWith(self,arguments);
        };
        return p;
    }
    
    /**
     * requestAnimationFrame を利用した.deferredIntervalを実行する。
     * @param {Number} [time] 実行する最低間隔(ms)
     * @return {jQueryTimeDeferred}
     */
    var deferredFrameInterval = function(time){
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
            d.rejectWith(self,arguments);
        };
        return p;
    }
    /**
     * @param {Number} [time]
     * @return {jQueryTimeDeferred}
     */
    $.deferredInterval = function (time) {
        return deferredInterval.apply(null,arguments);
    };
    /**
     * @param {Number} [time]
     * @return {jQueryTimeDeferred}
     */
    $.fn.deferredInterval = function (time) {
        return deferredInterval.apply(this, arguments);
    };
    /**
     * @param {Number} [time]
     * @return {jQueryTimeDeferred}
     */
    $.deferredTimeoutInterval = function (time) {
        return deferredTimeoutInterval.apply(null,arguments);
    };
    /**
     * @param {Number} [time]
     * @return {jQueryTimeDeferred}
     */
    $.fn.deferredTimeoutInterval = function (time) {
        return deferredTimeoutInterval.apply(this, arguments);
    };
    /**
     * @param {Number} [time]
     * @return {jQueryTimeDeferred}
     */
    $.deferredTimeout = function (time) {
        return deferredTimeout.apply(null, arguments);
    };
    /**
     * @param {Number} [time]
     * @return {jQueryTimeDeferred}
     */
    $.fn.deferredTimeout = function (time) {
        return deferredTimeout.apply(this,arguments);
    };
    /**
     * @param {Number} [time]
     * @return {jQueryTimeDeferred}
     */
    $.deferredIntervalTimeout = function (time) {
        return deferredIntervalTimeout.apply(null, arguments);
    };
    /**
     * @param {Number} [time]
     * @return {jQueryTimeDeferred}
     */
    $.fn.deferredIntervalTimeout = function (time) {
        return deferredIntervalTimeout.apply(this,arguments);
    };
    /**
     * @param {Number} [time]
     * @return {jQueryTimeDeferred}
     */
    $.deferredFrameTimeout = function(){
        return deferredFrameTimeout.apply(null,arguments);
    };
    /**
     * @param {Number} [time]
     * @return {jQueryTimeDeferred}
     */
    $.fn.deferredFrameTimeout = function(){
        return deferredFrameTimeout.apply(this,arguments);
    };
        /**
     * @param {Number} [time]
     * @return {jQueryTimeDeferred}
     */
    $.deferredFrameInterval = function(){
        return deferredFrameInterval.apply(null,arguments);
    };
    /**
     * @param {Number} [time]
     * @return {jQueryTimeDeferred}
     */
    $.fn.deferredFrameInterval = function(){
        return deferredFrameInterval.apply(this,arguments);
    };
    /**
     * eachのDeferred実装 呼び出し方としては<br/>
     * $.deferredEach(arry,fn);<br/>
     * として利用できる。
     * @param {Array|Object} arry 配列もしくは連想配列
     * @param {Function} fn 第一引数に key,第二引数にvalueを持つ関数 戻り値にはboolean とDeferredを使用することが出来る
     * @return {jQueryTimeDeferred}
     */
    $.deferredEach = function(arry,fn){
        var self = this;
        arry = $.map(arry,function(v,k){ return {v:v,k:k}; });
        var c = $.noop;
        var clear = function(){
            c.apply(null,arguments);
        }
        var p = $.Deferred().resolve()
        .then(function(){
            var d1 = $.Deferred();
            var clearFlag = false;
            //clear用
            c = function(){
                d1.rejectWith(self,arguments);
            }
            d1.always(function(){
                clearFlag = true;
            })
            var result;
            //reject、clear時
            d1.fail(function(){
                if(result && $.isFunction(result.promise)){
                    if($.isFunction(result.abort)){
                        result.abort();
                    }else if($.isFunction(result.clear)){
                        result.clear.apply(self,arguments);
                    }
                }
            });
            (function loop(){
                var arg = arguments,
                    a = Array.prototype.shift.apply(arg);
                if(a === undefined){
                    return $.Deferred().resolveWith(self);
                }
                return $.Deferred().resolve()
                .then(function(){
                    var d2 = $.Deferred();
                    if(!clearFlag && (result= fn.apply(a.v,[a.k,a.v])) === false){
                        //result が 真偽値の偽の時
                        d2.reject();
                    }else if(d2.resolve() && result && $.isFunction(result.promise)){
                       //result が Promise であるとき
                        d2 = d2.then(function(){
                            return result;
                        });
                    }
                    if(!clearFlag){
                        d2 = d2.then(function(){
                            return loop.apply(self,arg);
                        });
                    }
                    return d2;
                }).promise();
            }).apply(self,arry)
            .done(function(){
                d1.resolveWith(self,arguments);
            })
            .fail(function(){
                d1.rejectWith(self,arguments);
            });
            return d1.promise();
        }).promise();
        p.clear = clear;
        return p;
    };
    /**
     * @param {Function} fn
     * @return {jQueryTimeDeferred}
     */
    $.fn.deferredEach = function(fn){
        return $.deferredEach.call(this,this,fn);
    };
    /**
     * mapのDeferred実装 呼び出し方としては<br/>
     * $.deferredMap(arry,fn);<br/>
     * として利用できる。
     * @param {Array|Object} arry 配列もしくは連想配列
     * @param {Function} fn 第一引数に value,第二引数にkeyを持つ関数 戻り値には何等かの値 とDeferredを使用することが出来る。Deferredへの引数はその儘返す配列に変換される
     * @return {jQueryTimeDeferred}
     */
    $.deferredMap = function(arry,fn){
        var self = this;
        var clear = $.noop;
        arry = arry || [];
        arry = $.map(arry,function(v,k){ 
            var result = fn.apply(v,[v,k]);
            if(result && $.isFunction(result.promise)){
                result = result.then(function(){
                    return $.Deferred()
                        //resolve時に何も引数を指定しない場合、concat時に無視される様にする為に空の配列を引数を変更しておく
                        .resolveWith(this,arguments.length == 0?[[]]:arguments)
                        .promise();
                });
            }
            return result;
        });
        var p= $.Deferred(function(def){
            //待ち解除用のclear関数を準備
            clear = function(){ def.rejectWith(this,arguments); };
            // whenで全取得
            $.when.apply($,arry)
            .done(function(){ def.resolveWith(this,arguments); })
            .fail(function(){ def.rejectWith(this,arguments); });
            return def.promise();
        })
        .then(function(){
            return $.Deferred()
                .resolveWith(self,[Array.prototype.concat.apply([],arguments)]);
        });
        p.clear = clear;
        return p;
    };
    /**
     * @param {Function} fn
     * @return {jQueryTimeDeferred}
     */
    $.fn.deferredMap = function(fn){
        return $.deferredMap.call(this,this,fn);
    };
    
    $.deferredGrep = function(arry,fn,inv){
        var self = this;
        var clear = $.noop;
        inv = !!inv;
        arry = arry || [];
        if(!$.isFunction(fn)){
            return $.Deferred().resolveWith(self,[[]]).promise();
        }
        var length = arry.length,
            base = new Array(length),
            whenArray = new Array(length);
        for(var i=0;i<length;i++){
            (function(v,n){
                base[n] ={v:v,f:undefined};
                var result = fn.apply(v,[v,n]);
                if(result && $.isFunction(result.promise)){
                    result = result.then(function(){
                        base[n].f = true !== inv;
                        return $.Deferred().resolveWith(this,arguments).promise();
                    },function(){
                        base[n].f = false !== inv;
                        return $.Deferred().resolveWith(this,arguments).promise();
                    })
                }else{
                    base[n].f = inv !== result;
                }
                whenArray[n] = result;
            })(arry[i],i);
        }
        var p = $.Deferred(function(d){
            $.when.apply($,whenArray)
            .done(function(){ d.resolveWith(this,arguments); })
            .fail(function(){ d.rejectWith(this,arguments); })
            .progress(function(){ d.notifyWith(this,arguments); })
            clear = function(){ d.rejectWith(self,arguments); };
            return d.promise();
        })
        .then(function(){
            var newArray = [];
            for(var i=0,j=0,imax=base.length;i<imax;i++){
                if(base[i].f)
                    newArray[j++] = base[i].v;
            }
            return $
                .Deferred()
                .resolveWith(self,[newArray])
                .promise();
        });
        p.clear = clear;
        return p;
    }
})(jQuery,window);