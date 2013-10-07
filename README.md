#jQuery.timeout について
##概要
setTimeout のjQuery.Deferred実装。setInterval等の時間関連関数を元としたjQuery.Deferred実装及びUtilityの jQuery plugin
##用法
    <script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js"></script>
    <script type="text/javascript" src="./js/jquery.timeout.js"></script>
で読み込んで実行してください。
##関数仕様

    $.timeout(time).done(function(){ /* action */});
の様にDeferredを返す為、Deferredチェーンを行って使用します。
尚、各関数には $. 版と $.fn. 版の両方があり、$.fn. 版だとthis がその要素自身になります。
###.timeout(time)
言わずもがなな setTimeout(callback,time) の Deferred 実装。完了するとresolve,キャンセルされると reject する。
###.interval(time)
言わずもがなな setInterval(callback,time) の Deferred 実装。時間になるとnofity,キャンセルされると rejectする。
###.tInterval(time)
.interval(time) を setTimeout() を利用して実装した物。.interval() の様に時間に正確ではないが、無理の無い実行が利点。
###.iTimeout(time)
.timeout(time) を setInterval() を利用して実装した物。厳密なタイミングが設定出来るのはポイント。
###.frameTimeout(time)
requestAnimationFrame(callback) を利用して .timeout(time) を実装した物。フレーム更新間隔に合わせて呼ばれる為、画面更新の際に使える。
###.frameInterval(time)
requestAnimationFrame(callback) を利用して .interval(time) を実装した物。フレーム更新間隔に合わせて呼ばれる為、画面更新の際に使える。
###.dEach(arry,fn(key,value))
###.dEach(arry,time,fn(key,value))
###.dEach(arry,fn(key,value),tdf(time))
###.dEach(arry,time,fn(key,value),tdf(time))
尚、このプラグインはサロゲートペアに対応している為、最新のUnicode6.0文字などでも不具合無く抽出することが出来ます。