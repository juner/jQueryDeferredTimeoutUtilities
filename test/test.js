;(function($,$Q,undefined){
    "use strict";
    /**
     * $.dTimeout,$.fn.dTimeout 周りのテスト5件
     */
    $Q.test( "dTimeout のテスト",5, function() {
        var $test=$([]);
        ok($.isFunction($.dTimeout), "$.dTimeout は関数として定義されている" );
        ok($.isFunction($.fn.dTimeout),"$.fn.dTimeout は関数として定義されている");
        stop();
        $.dTimeout(10)
        .done(function(){
            start();
            ok(true,"$.dTimout で遅延動作する");
        })
        .then(function(){
            $test = $("<div/>").prependTo("body");
            stop();
            return $test.dTimeout(10);
        })
        .done(function(){
            start();
            ok($(this).is($test),"dTimeout された際の要素はdTimeoutした際の元の要素であること");
            $test.remove();
        })
        .then(function(){
            var t = $.dTimeout(300);
            $.dTimeout(10)
            .done(function(){
                t.clear();
            })
            stop();
            return t;
        })
        .always(function(){
            start();
        })
        .done(function(){
            ok(false,"dTimeoutのDefferedにあるclearメソッドによりrejectが可能であること");
        })
        .fail(function(){
            ok(true,"dTimeoutのDefferedにあるclearメソッドによりrejectが可能であること");
        })
    });
    $Q.test("dInterval のテスト",5,function(){
        ok($.isFunction($.dInterval), "$.dInterval は関数として定義されている" );
        ok($.isFunction($.fn.dInterval),"$.fn.dInterval は関数として定義されている");
        stop();
        $.Deferred(function(d){
            var c = $.dInterval(10),
                clear = c.clear,
                i = 0;
            c.progress(function(){
                if(3<++i) clear();
            })
            .fail(function(){
                ok(true,"$.dInterval は戻り値のPromiseにあるclearメソッドのみを行う事でループから脱出出来る。");
                d.resolve();
            });
            $.dTimeout(100)
            .done(function(){ clear(); d.resolve(); });
            d.always(function(){
                start();
                ok(3<i,"$.dInterval は指定時間毎にnotifyする。");
            })
            return d.promise();
        })
        .then(function(){
            var d = $.Deferred(),
                $div = $("<div/>").appendTo("body"),
                c = $div.dInterval(10),
                clear = c.clear,
                i = 0;
            stop();
            c.progress(function(){
                if(3<(++i)) clear();
            })
            .fail(function(){ d.resolveWith(this); });
            $.dTimeout(100)
            .done(function(){ clear(); d.resolve(); })
            d.always(function(){
                start();
                ok($(this).is($div),"$.fn.dIntervalされた際の要素はdIntervalした要素を元にすること")
            })
        });
    });
    $Q.test("dTimeoutInterval のテスト",function(){
        ok($.isFunction($.dTimeoutInterval), "$.dTimeoutInterval は関数として定義されている" );
        ok($.isFunction($.fn.dTimeoutInterval),"$.fn.dTimeoutInterval は関数として定義されている");
    });
    $Q.test("dIntervalTimeout のテスト",function(){
        ok($.isFunction($.dIntervalTimeout), "$.dIntervalTimeout は関数として定義されている" );
        ok($.isFunction($.fn.dIntervalTimeout),"$.fn.dIntervalTimeout は関数として定義されている");
    });
    $Q.test("dFrameTimeout のテスト",function(){
        ok($.isFunction($.dFrameTimeout), "$.dFrameTimeout は関数として定義されている" );
        ok($.isFunction($.fn.dFrameTimeout),"$.fn.dFrameTimeout は関数として定義されている");
    });
    $Q.test("dFrameInterval のテスト",function(){
        ok($.isFunction($.dFrameInterval), "$.dFrameInterval は関数として定義されている" );
        ok($.isFunction($.fn.dFrameInterval),"$.fn.dFrameInterval は関数として定義されている");
    });
    $Q.test("dEach のテスト",function(){
        ok($.isFunction($.dEach), "$.dEach は関数として定義されている" );
        ok($.isFunction($.fn.dEach),"$.fn.dEach は関数として定義されている");
        stop();
        var sum=0;
        $.dEach([1,2,3,4],10,function(k,v){
            sum+=v;
        })
        .done(function(){
            start();
            ok(sum==10,"対象配列を指定時間間隔でチェックする");
        });
    })
})(jQuery,QUnit);