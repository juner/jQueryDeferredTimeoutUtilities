;(function($,$Q,undefined){
    "use strict";
    /**
     * $.deferredTimeout インターフェースについての評価
     */
    var deferredTimeoutInterfaceTest = function(fnName){
        $Q.test("deferredTimeoutインターフェースに於ける "+fnName+"のテスト",5,function(){
            ok($.isFunction($[fnName]), "$."+fnName+" は関数として定義されている" );
            ok($.isFunction($.fn[fnName]),"$.fn."+fnName+" は関数として定義されている");
            stop();
            $.Deferred().resolve()
            .then(function(){
                //テスト①：実行すると指定時間後にresolveする。
                //（この際時間の正確さは求めない為、resolveするかの確認）
                return $[fnName](10)
                .done(function(){
                    start();
                    ok(true,"$."+fnName+" で遅延動作する");
                })
            })
            .then(function(){
                //テスト②：要素に付属される関数として実行すると、コールバック時に呼び元の要素がthisになる。
                stop();
                var $test = $("<div/>").prependTo("body");
                return $test[fnName](10)
                .done(function(){
                    start();
                    ok($(this).is($test),fnName+" された際の要素は"+fnName+"した際の元の要素であること");
                    $test.remove();
                });
            })
            .then(function(){
                //テスト③：戻り値のPromiseに付随したclear関数によるrejectの確認。
                stop();
                var waitTime = 300;
                var clearTime = 10;
                var t = $[fnName](waitTime);
                var mes = fnName+"のPromiseにあるclearメソッドによりrejectが可能であること";
                setTimeout(function(){
                    t.clear();
                },clearTime);
                return t
                .always(function(){ start(); })
                .done(function(){ ok(false,mes); })
                .fail(function(){ ok(true,mes); });
            });
        });
    };
    
    var deferredIntervalInterfaceTest = function(fnName){
            $Q.test("deferredIntervalインターフェースに於ける "+fnName+" のテスト",5,function(){
            ok($.isFunction($[fnName]), "$."+fnName+" は関数として定義されている" );
            ok($.isFunction($.fn[fnName]),"$.fn."+fnName+" は関数として定義されている");
            stop();
            $.Deferred(function(d){
                var c = $[fnName](10),
                    clear = c.clear,
                    i = 0;
                c.progress(function(){
                    if(3<++i) clear();
                })
                .fail(function(){
                    ok(true,"$."+fnName+" は戻り値のPromiseにあるclearメソッドのみを行う事でループから脱出出来る。");
                    d.resolve();
                });
                $.deferredTimeout(100)
                .done(function(){ clear(); d.resolve(); });
                d.always(function(){
                    start();
                    ok(3<i,"$."+fnName+" は指定時間毎にnotifyする。");
                })
                return d.promise();
            })
            .then(function(){
                var d = $.Deferred(),
                    $div = $("<div/>").appendTo("body"),
                    c = $div[fnName](10),
                    clear = c.clear,
                    i = 0;
                stop();
                c.progress(function(){
                    if(3<(++i)) clear();
                })
                .fail(function(){ d.resolveWith(this); });
                $.deferredTimeout(100)
                .done(function(){ clear(); d.resolve(); })
                d.always(function(){
                    start();
                    ok($(this).is($div),"$.fn"+fnName+"された際の要素は"+fnName+"した要素を元にすること");
                    $div.remove();
                    $div=$([]);
                });
            });
        });
    };
    //deferredTimeoutインターフェースを元にした deferredTimeout のテスト
    deferredTimeoutInterfaceTest("deferredTimeout");
    
    //deferredIntervalインターフェースを元にした deferredInterval のテスト
    deferredIntervalInterfaceTest("deferredInterval");
    
    //deferredIntervalインターフェースを元にした deferredTimeoutInterval のテスト
    deferredIntervalInterfaceTest("deferredTimeoutInterval");
    
    //deferredTimeoutインターフェースを元にした deferredIntervalTimeout のテスト
    deferredTimeoutInterfaceTest("deferredIntervalTimeout");
    
    //deferredTimeoutインターフェースを元にした deferredFrameTimeout のテスト
    deferredTimeoutInterfaceTest("deferredFrameTimeout");
    
    //deferredIntervalインターフェースを元にした deferredFrameInterval のテスト
    deferredIntervalInterfaceTest("deferredFrameInterval");
    
    $Q.test("deferredEach のテスト",8,function(){
        ok($.isFunction($.deferredEach), "$.deferredEach は関数として定義されている" );
        ok($.isFunction($.fn.deferredEach),"$.fn.deferredEach は関数として定義されている");
        stop();
        $.Deferred().resolve()
        .then(function(){
            var sum = 0;
            var arry = [1,2,3,4];
            return $.deferredEach(arry,function(k,v){
                sum+=v;
            })
            .done(function(){
                start();
                ok(sum==10,"対象配列を元に.eachの様に動作する");
            });
        })
        .then(function(){
            var sum = 0;
            var arry = [1,2,3,4];
            var arry_sum = function (arry){ var sum = 0; for(var i=0,imax=arry.length;i<imax;i++){ sum += arry[i];  } return sum; }(arry);
            stop();
            var $div = $("<div/>").prependTo("body");
            for(var i =0,imax=arry.length;i<imax;i++){
                $div.append($("<span/>").text(arry[i]));
            }
            return $div.find(">*").deferredEach(function(){
                sum+=Number($(this).text());
            })
            .always(function(){ start(); })
            .done(function(){
                //配列の値を要素から取得して加算した結果が合致する
                ok(sum==arry_sum,"$.fn.deferredEachでも$.deferredEachと同様に実行が可能である。");
                var _$div = $(this).parent();
                ok($(this).parent().is($div),"$.fn.eachと同様に各要素がthisになること。");
                $div.remove();
                
            })
        })
        .then(function(){
            stop();
            var sum = 0;
            var arry = [1,2,3,4];
            
            var d= $.deferredEach(arry,function(k,v){
                //10ms毎にarryの要素一つを
                sum+=v;
                return $.deferredTimeout(15);
            }),
                clear = d.clear;
            $.deferredTimeout(10)
            .done(function(){
                clear();
                
            });
            return d
            .always(function(){
                start();
                //10ms秒で1回目実行されあ後にdTimeout(10)がresolveになる為、dEachは1回だけ実施される
                ok(sum == 1,"deferredEachは戻り値のjQuery.Deferredにclearが拡張されており、それを実行することで外部から強制rejectが出来る。");
            })
            .fail(function(){
                ok(true,"clearが実行された場合、通常の様に正常完了のresolveではなく、中断の意味合いを持たせるのでrejectされる。");
            })
            .then(undefined,function(){ return $.Deferred().resolve(); })
        })
        .then(function(){
            var sum = 0;
            var arry = [1,2,3,4];
            stop();
            return $.deferredEach(arry,function(k,v){
                sum+=v;
                if(1<k){
                    return false;
                }
            })
            .always(function(){ 
                start();
                ok(sum == 6,"deferredEachのコールバック内でfalseを返す事でrejectしてループを抜ける事が出来る。");
            })
            .then(undefined,function(){ return $.Deferred().resolve(); });
        })
        .then(function(){
            stop();
            var sum = 0;
            var arry = [1,2,3,4];
            return $.deferredEach(arry,10,function(k,v){
                sum += v;
                if(1<k){
                    return $.Deferred().reject().promise();
                }
            })
            .always(function(){ start(); })
            .fail(function(){
                ok(sum == 6,"deferredEachのコールバック内でDeferredを返し、それをrejectする事でrejectしてループを抜ける事が出来る。");
            });
        });
    });
    $Q.test("deferredMap のテスト",function(){
        ok($.isFunction($.deferredMap), "$.deferredMap は関数として定義されている" );
        ok($.isFunction($.fn.deferredMap),"$.fn.deferredMap は関数として定義されている");
        stop();
        $.Deferred().resolve()
        .then(function(){
            var anc ="";
            var array = (function(){
                var a=[];
                var start="A".charCodeAt();
                for(var i=0,imax=15;i<imax;i++){
                    a[i] = { time:((imax-i)*10) ,text:String.fromCharCode(start+i) };
                    anc += a[i].text;
                }
                return a;
            })();
            console.log(anc);
            var log
            return $.deferredMap(array,function(v,k){
                return $.deferredTimeout(v.time)
                .then(function(){
                    return $.Deferred().resolve(v.text);
                });
            })
            .always(function(){ start(); })
            .done(function(arry){
                var argpattern = Array.prototype.join.call(arry,"");
                ok(anc === argpattern,"配列毎に返す値に基づいた配列を返すタイミングに依らずに実行開始順に返している");
                
            });
        }).then(function(){
            
        })
    });
})(jQuery,QUnit);