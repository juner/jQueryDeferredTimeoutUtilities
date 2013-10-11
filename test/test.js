;(function($,$Q,undefined){
    "use strict";
    /**
     * $.deferredTimeout インターフェースについての評価
     */
    var deferredTimeoutInterfaceTest = function(fnName){
        $Q.test("deferredTimeoutインターフェースに於ける "+fnName+"のテスト",5,function(){
           var $test=$([]);
           ok($.isFunction($[fnName]), "$."+fnName+" は関数として定義されている" );
           ok($.isFunction($.fn[fnName]),"$.fn."+fnName+" は関数として定義されている");
           stop();
           $[fnName](10)
           .done(function(){
                start();
                ok(true,"$."+fnName+" で遅延動作する");
            })
            .then(function(){
                $test = $("<div/>").prependTo("body");
                stop();
                return $test[fnName](10);
            })
            .done(function(){
                start();
                ok($(this).is($test),fnName+" された際の要素は"+fnName+"した際の元の要素であること");
                $test.remove();
                $test = $([]);
            })
            .then(function(){
                var t = $[fnName](300);
                setTimeout(function(){
                    t.clear();
                },10);
                stop();
                return t;
            })
            .always(function(){
                start();
            })
            .done(function(){
                ok(false,fnName+"のPromiseにあるclearメソッドによりrejectが可能であること");
            })
            .fail(function(){
                ok(true,fnName+"のPromiseにあるclearメソッドによりrejectが可能であること");
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
    
    $Q.test("deferredEach のテスト",function(){
        ok($.isFunction($.deferredEach), "$.deferredEach は関数として定義されている" );
        ok($.isFunction($.fn.deferredEach),"$.fn.deferredEach は関数として定義されている");
        var sum = 0;
        var arry = [1,2,3,4];
        $.Deferred().resolve()
        .then(function(){
            stop();
            return $.deferredEach(arry,10,function(k,v){
                sum+=v;
            });
        })
        .done(function(){
            start();
            ok(sum==10,"対象配列を指定時間間隔でチェックする");
        })
        .then(function(){
            var $div = $("<div/>").prependTo("body");
            for(var i =0,imax=arry.length;i<imax;i++){
                $div.append($("<span/>").text(arry[i]));
            }
            sum = 0;
            stop();
            return $div.find(">*").deferredEach(10,function(){
                sum+=Number($(this).text());
            })
            .done(function(){
                $div.remove();
            });
        })
        .done(function(){
            start();
            ok(sum==10,"$.fn.deferredEachでも$.deferredEachと同様に実行が可能であり、$.fn.eachと同様に各要素がthisになること。")
        })
        .then(function(){
            stop();
            sum = 0;
            var d= $.deferredEach(arry,10,function(k,v){
                sum+=v;
            }),
                clear = d.clear;
            $.deferredTimeout(10)
            .done(function(){
                clear();
            });
            return d;
        })
        .always(function(){
            start();
            //10ms秒で1回目実行されあ後にdTimeout(10)がresolveになる為、ｄEachは1回だけ実施される
            ok(sum == 1,"deferredEachは戻り値のjQuery.Deferredにclearが拡張されており、それを実行することで外部から強制rejectが出来る。");
        })
        .fail(function(){
            ok(true,"clearが実行された場合、通常の様に正常完了のresolveではなく、中断の意味合いを持たせるのでrejectされる。");
        })
        .then(undefined,function(){ return $.Deferred().resolve(); })
        .then(function(){
            sum = 0;
            stop();
            return $.deferredEach(arry,10,function(k,v){
                sum+=v;
                console.log(k+":"+v+":"+sum);
                if(1<k){
                    return false;
                }
            })
        })
        .always(function(){ 
            start();
            console.log(sum);
            ok(sum == 6,"dEachはコールバック内でfalseを返す事でrejectしてループを抜ける事が出来る。");
        })
        .then(undefined,function(){ return $.Deferred().resolve(); })
        .then(function(){
            stop();
            sum = 0;
            return $.deferredEach(arry,10,function(k,v){
                sum += v;
                if(1<k){
                    return $.Deferred().reject().promise();
                }
            })
        })
        .always(function(){ 
            start(); 
            ok(sum == 6,"deferredEachはコールバック内でDeferredを返し、それをrejectする事でループを抜ける事が出来る。")              
        })
        .done(function(){
            ok(false,"deferredEachはコールバック内でDeferredを返し、それをrejectする事でrejectしてループを抜ける事が出来る。");
        })
        .fail(function(){
            ok(true,"deferredEachはコールバック内でDeferredを返し、それをrejectする事でrejectしてループを抜ける事が出来る。");
        });
    })
})(jQuery,QUnit);