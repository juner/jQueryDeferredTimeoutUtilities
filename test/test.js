;(function($,$Q,undefined){
    "use strict";
    /**
     * $.deferredTimeout インターフェースについての評価
     */
    var deferredTimeoutInterfaceTest = function(fnName){
        $Q.test("deferredTimeoutインターフェースに於ける "+fnName+"のテスト",6,function(){
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
                    t.clear(1,2,3,4,5);
                },clearTime);
                return t
                .always(function(){ start(); })
                .done(function(){ ok(false,mes); })
                .fail(function(){ ok(true,mes); })
                .fail(function(){
                    //引数を配列にして比較用
                    var a = Array.prototype.slice.call(arguments);
                    //再現した配列
                    var anc = [1,2,3,4,5];
                    deepEqual(a,anc,"clear 時の引数がfail時に渡されていること")
                })
            })
        });
    };
    
    var deferredIntervalInterfaceTest = function(fnName,deferredTimeoutFunction){
            $Q.test("deferredIntervalインターフェースに於ける "+fnName+" のテスト",6,function(){
            ok($.isFunction($[fnName]), "$."+fnName+" は関数として定義されている" );
            ok($.isFunction($.fn[fnName]),"$.fn."+fnName+" は関数として定義されている");
            stop();
            $.Deferred(function(d){
                var c = $[fnName](10),
                    clear = c.clear,
                    i = 0;
                c.progress(function(){
                    if(3<++i) clear(1,2,3,4,5);
                })
                .fail(function(){
                    ok(true,"$."+fnName+" は戻り値のPromiseにあるclearメソッドのみを行う事でループから脱出出来る。");
                    d.resolveWith(null,arguments);
                })
                .fail(function(){
                    var a = Array.prototype.slice.call(arguments);
                    var anc = [1,2,3,4,5];
                    deepEqual(a,anc,"clear時の引数がfailに渡されている事。");
                })
                deferredTimeoutFunction(100)
                .done(function(){ clear(); d.resolve(); });
                d.always(function(){
                    start();
                    ok(3<i,"$."+fnName+" は指定時間毎にnotifyする。");
                });
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
    deferredIntervalInterfaceTest("deferredInterval",$.deferredIntervalTimeout);
    
    //deferredIntervalインターフェースを元にした deferredTimeoutInterval のテスト
    deferredIntervalInterfaceTest("deferredTimeoutInterval",$.deferredTimeout);
    
    //deferredTimeoutインターフェースを元にした deferredIntervalTimeout のテスト
    deferredTimeoutInterfaceTest("deferredIntervalTimeout");
    
    //deferredTimeoutインターフェースを元にした deferredFrameTimeout のテスト
    deferredTimeoutInterfaceTest("deferredFrameTimeout");
    
    //deferredIntervalインターフェースを元にした deferredFrameInterval のテスト
    deferredIntervalInterfaceTest("deferredFrameInterval",$.deferredFrameTimeout);
    
    $Q.test("deferredEach のテスト",11,function(){
        ok($.isFunction($.deferredEach), "$.deferredEach は関数として定義されている" );
        ok($.isFunction($.fn.deferredEach),"$.fn.deferredEach は関数として定義されている");
        stop();
        $.Deferred().resolve()
        .then(function(){
            //テスト①：$.deferredEach が $.each と戻り値が違うだけで同様の動作をすることを確認。
            var sum = 0;
            var arry = [1,2,3,4];
            return $.deferredEach(arry,function(k,v){
                sum+=v;
            })
            .done(function(){
                start();
                equal(sum,10,"対象配列を元に.eachの様に動作する");
            });
        })
        .then(function(){
            //テスト②：$.fn.deferredEach が $.fn.each と戻り値が違うだけで同様の動作をすることを確認。
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
                equal(sum,arry_sum,"$.fn.deferredEachでも$.deferredEachと同様に実行が可能である。");
                var _$div = $(this).parent();
                ok($(this).parent().is($div),"$.fn.eachと同様に各要素がthisになること。");
                $div.remove();
                
            })
        })
        .then(function(){
            //テスト③：$.deferredEach の戻り値のclear関数の動作確認
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
                clear(1,2,3,4,5);
            });
            return d
            .always(function(){
                start();
                //10ms秒で1回目実行されあ後にdTimeout(10)がresolveになる為、dEachは1回だけ実施される
                equal(sum,1,"deferredEachは戻り値のjQuery.Deferredにclearが拡張されており、それを実行することで外部から強制rejectが出来る。");
            })
            .fail(function(){
                ok(true,"clearが実行された場合、通常の様に正常完了のresolveではなく、中断の意味合いを持たせるのでrejectされる。");
            })
            .done(function(){ ok(false,"clearが有効"); })
            .fail(function(){
                var a = Array.prototype.slice.call(arguments);
                var anc = [1,2,3,4,5];
                deepEqual(a,anc,"clear時にfailの引数がちゃんと渡されていること");
            })
            .done(function(){ ok(false,"clearの引数のチェック"); })
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
            .always(function(){ start(); })
            .fail(function(){ ok(true,"deferredEachのコールバック内でfalseを返す事でrejectされる"); })
            .done(function(){ ok(false,"deferredEachのコールバック内でfalseを返す事でrejectされる");  })
            .always(function(){
                equal(sum,6,"deferredEachのコールバック内でfalseを返す事でrejectしてループを抜ける事が出来る。");
            })
            .then(undefined,function(){ return $.Deferred().resolve(); });
        })
        .then(function(){
            stop();
            var sum = 0;
            var arry = [1,2,3,4];
            return $.deferredEach(arry,function(k,v){
                sum += v;
                if(1<k){
                    return $.Deferred().reject().promise();
                }
            })
            .always(function(){ start(); })
            .fail(function(){
                deepEqual(sum,6,"deferredEachのコールバック内でDeferredを返し、それをrejectする事でrejectしてループを抜ける事が出来る。");
            })
            .done(function(){ ok(false,"戻り値のDeferredのrejectが効く"); })
        }).then(undefined,function(){ return $.Deferred().resolve();});
    });
    $Q.test("deferredMap のテスト",10,function(){
        ok($.isFunction($.deferredMap), "$.deferredMap は関数として定義されている" );
        ok($.isFunction($.fn.deferredMap),"$.fn.deferredMap は関数として定義されている");
        $.Deferred().resolve()
        .then(function(){
            var array = (function(){
                var a=[];
                var start="A".charCodeAt();
                for(var i=0,imax=15;i<imax;i++){
                    a[i] = { time:((imax-i)*10) ,text:String.fromCharCode(start+i) };
                }
                return a;
            })();
            var anc =$.map(array,function(v,k){
                return v.text;
            });
            return $.deferredMap(array,function(v,k){
                return v.text
            })
            .done(function(arry){
                deepEqual(arry,anc,"deferredMapは$.mapの様に動作する。");
            });
        }).then(function(){
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
            stop();
            return $.deferredMap(array,function(v,k){
                return $.deferredTimeout(v.time)
                .then(function(){
                    return $.Deferred().resolve(v.text);
                });
            })
            .always(function(){ start(); })
            .done(function(arry){
                var argpattern = Array.prototype.join.call(arry,"");
                deepEqual(argpattern,anc,"配列毎に返す値に基づいた配列を返すタイミングに依らずに実行開始順に返している");
            });
        }).then(function(){
            var anc ="";
            var anti =["C","G","H"];
            var array = (function(){
                var a=[];
                var start="A".charCodeAt();
                for(var i=0,imax=15;i<imax;i++){
                    a[i] = { time:((imax-i)*10) ,text:String.fromCharCode(start+i) };
                    if($.inArray(a[i].text,anti) == -1){
                        anc += a[i].text;
                    }
                }
                return a;
            })();
            stop();
            return $.deferredMap(array,function(v,k){
                return $.deferredTimeout(v.time)
                .then(function(){
                    if($.inArray(v.text,anti) == -1){
                        return $.Deferred().resolve(v.text);
                    }else{
                        return $.Deferred().resolve();
                    }
                });
            })
            .always(function(){ start(); })
            .done(function(arry){
                var argpattern = Array.prototype.join.call(arry,"");
                deepEqual(argpattern,anc,"resolve時に何も引数に持たせない場合は含まれない");
                deepEqual(arry.length,anc.length,"resolve時に何も引数に持たせない場合は配列に追加されない為、その要素数の確認");
            });
        })
        .then(function(){
            var anc ="";
            var anti =["C","G","H"];
            var array = (function(){
                var a=[];
                var start="A".charCodeAt();
                for(var i=0,imax=15;i<imax;i++){
                    a[i] = { time:((imax-i)*10) ,text:String.fromCharCode(start+i) };
                }
                return a;
            })();
            stop();
            return $.deferredMap(array,function(v,k){
                return $.deferredTimeout(v.time)
                .then(function(){
                    if($.inArray(v.text,anti) == -1){
                        return $.Deferred().resolve(v.text);
                    }else{
                        return $.Deferred().reject(v.text);
                    }
                });
            })
            .always(function(){ start(); })
            .fail(function(str){
                ok($.inArray(str,anti),"rejectするとその引数状態で値を返す");
            })
            .done(function(){ ok(false,"rejectが有効である。");  })
            .then(undefined,function(){
                return $.Deferred().resolve();
            });
        })
        .then(function(){
            var anc ="";
            var anti =["C","G","H"];
            var array = (function(){
                var a=[];
                var start="A".charCodeAt();
                for(var i=0,imax=15;i<imax;i++){
                    a[i] = { time:((imax-i)*10) ,text:String.fromCharCode(start+i) };
                    anc += a[i].text;
                    if(0<=$.inArray(a[i].text,anti)){
                        anc+="X";
                    }
                }
                return a;
            })();
            stop();
            return $.deferredMap(array,function(v,k){
                return $.deferredTimeout(v.time)
                .then(function(){
                    if(0<=$.inArray(v.text,anti)){
                        return $.Deferred().resolve(v.text,"X");
                    }else{
                        return $.Deferred().resolve(v.text);
                    }
                });
            })
            .always(function(){ start(); })
            .done(function(arry){
                var argpattern = Array.prototype.join.call(arry,"");
                deepEqual(anc,argpattern,"resolve時返す引数が複数だと配列に追加される項目数がその引数分追加される");
                equal(anc.length,arry.length,"resolve時に返す引数の数が増えた場合の返す要素数の確認")
            });
        })
        .then(function(){
            var array = [100,200,300,400,500];
            var d = $.deferredMap(array,function(v,k){
                return $.deferredTimeout(v).then(function(){
                    return $.Deferred().resolve(v);
                })
            });
            $.deferredTimeout(100).done(function(){
                d.clear(1,2,3,4,5);
            });
            stop();
            return d
            .always(function(){ start(); })
            .fail(function(){
                var a = Array.prototype.slice.call(arguments);
                var anc = [1,2,3,4,5];
                deepEqual(a,anc,"clear時の引数がfail時に渡されていること");
            })
            .done(function(){ ok(false,"clearが失敗"); })
            .then(undefined,function(){
                return $.Deferred().resolve();
            })
        });
    });
    $Q.test("deferredGrep のテスト",function(){
        ok($.isFunction($.deferredGrep), "$.deferredGrep は関数として定義されている" );
        $.Deferred().resolve()
        .then(function(){
            var arry = [1,2,3,4,5];
            var anc = $.grep(arry,function(v,k){
                return 3< v;
            });
            return $.deferredGrep(arry,function(v,k){
                return 3 < v;
            })
            .done(function(arry){
                var argpattern = Array.prototype.join.call(arry,"");
                var ancpattern = Array.prototype.join.call(anc,"");
                deepEqual(argpattern,ancpattern,"grepの様に動作する");
            });
        })
        .then(function(){
            var arry = [1,2,3,4,5];
            var anc = $.grep(arry,function(v,k){
                return 3< v;
            });
            stop();
            return $.deferredGrep(arry,function(v,k){
                var d = $.deferredTimeout(v*10);
                if(!(3 < v)){
                    d = d.then(function(){
                        return $.Deferred().reject();
                    });
                }
                return d;
            })
            .always(function(){ start(); })
            .done(function(arry){
                var argpattern = Array.prototype.join.call(arry,"");
                var ancpattern = Array.prototype.join.call(anc,"");
                deepEqual(argpattern,ancpattern,"戻り値にdeferredを渡すと resolveだとtrueを返した代わり、rejectだとfalseを返した代わりとして機能する。");
            });
        })
        .then(function(){
            var array = [100,200,300,400,500];
            stop();
            var d = $.deferredGrep(array,function(v,k){
                return $.deferredTimeout(v);
            });
            $.deferredTimeout(100)
            .done(function(){
                d.clear(1,2,3,4,5);
            });
            return d
            .always(function(){ start(); })
            .fail(function(){
                var a = Array.prototype.slice.call(arguments);
                var anc = [1,2,3,4,5];
                deepEqual(a,anc,"clear時の引数がfailに渡されていること");
            })
            .then(undefined,function(){
                return $.Deferred().resolve();
            });
        })
    });
})(jQuery,QUnit);