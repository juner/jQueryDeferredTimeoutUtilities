#jQuery deferredTimeoutUtilities について
##概要
setTimeout のjQuery.Deferred実装。setInterval等の時間関連関数を元としたjQuery.Deferred実装及びUtilityの jQuery plugin
##用法
    <script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js"></script>
    <script type="text/javascript" src="./js/jquery.deferredTimeoutUtilities.js"></script>
で読み込んで実行してください。
##関数仕様
    $.dTimeout(time).done(function(){ /* action */});
の様にDeferredを返す為、Deferredチェーンを行って使用します。
尚、各関数には $. 版と $.fn. 版の両方があり、$.fn. 版だとDeferred呼び出し時のthis がその要素自身になります。
また、setTimeout、setIntervalを使用する都合上、clearTimeout、clearIntervalを行う為に戻り値のDeferredはclear()という関数を持ち、それを実行することで強制的にrejectされます。
###.deferredTimeout(time)
言わずもがなな setTimeout(callback,time) の Deferred 実装。time(ms)後にresolve,キャンセルされると reject する。
これをインターフェースとして別実装が幾つか用意されている
###.deferredIntervalTimeout(time)
.deferredTimeout インターフェース を setInterval() を利用して実装した物。厳密なタイミングが設定出来るのはポイント。
###.deferredFrameTimeout(time)
.deferredTimeout インターフェース を requestAnimationFrame(callback) を利用してを実装した物。フレーム更新間隔に合わせて呼ばれる為、画面更新の際に使える。
###.deferredInterval(time)
言わずもがなな setInterval(callback,time) の Deferred 実装。time(ms)経つとnofity,キャンセルされると rejectする。
これをインターフェースとして別実装が幾つか用意されている
###.deferredTimeoutInterval(time)
.deferredInterval インターフェース を setTimeout() を利用して実装した物。.deferredInterval() の様に時間に正確ではないが、無理の無い実行が利点。
###.deferredFrameInterval(time)
.deferredTimeout インターフェース を requestAnimationFrame(callback) を利用して実装した物。フレーム更新間隔に合わせて呼ばれる為、画面更新の際に使える。
###.deferredEach(arry,fn(key,value))
.eachをDeferred対応させた物。
コールバック関数の戻り値としてはfalseかjQuery.Deferred.Promiseオブジェクトを使用する事が出来る。falseを使用した場合は即時途中キャンセルとされ、rejectされる。fnの戻り値としてjQuery.Deferred.Promiseオブジェクトを使用した場合、rejecされるとキャンセルされ、resolveｓれると続行する。
また、jQueryの要素から呼ばれる場合は第一引数を不要とする。(※例: $(elms).dferredEach(1000,function(){/* action */}).done(function(){/* ok action */}))
コールバック関数:tdfを指定すると .dTimeout と同系統の機能を持つ関数であれtime(ms)の経過の為に使用する。
尚、戻り値のjQuery.Deferred.Promiseオブジェクトには clear関数が設定されており、それを実行することでも強制的にrejectしてループを終わらせることが出来る。
###.deferredMap(arry,fn(value,key))
.mapをDeferred対応させた物。 指定の配列または連想配列を元に