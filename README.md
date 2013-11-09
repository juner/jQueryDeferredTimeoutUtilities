jQuery deferredTimeoutUtilities について
======
#概要
このユーティリティは以下の2つの目的の為に実装されています。
+ JavaScriptで利用されるタイマ系関数のコールバック関数をjQuery.Deferredで外出しにすることで使いやすくした関数群（6種）
+ jQueryに於けるUtility関数の戻り値とコールバック関数の戻り値にjQuery.Deferredを対応させた関数群（3種）

※jQuery.Deferred は jQuery 1.5以降に追加された非同期処理を扱いやすくする為の仕組みです。
#対応jQueryバージョン
jQuery 1.8 以上  
（※jQuery 1.8 以降で jQuery.Deferred.then の動作仕様が変わった為
#用法
    <script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js"></script>
    <script type="text/javascript" src="./js/jquery.deferredTimeoutUtilities.js"></script>
で読み込んで実行してください。

#基本仕様
このプラグインの関数は全てjQuery.Deferred.Promiseオブジェクトを戻り値として持つ関数となります。

この戻り値はclear関数を追加されており、実行することで強制的にrejectを行う事が出来ます。(尚、clearに渡した引数はその儘fail等で使用することが出来ます）
#インターフェース
このプラグインには幾つも関数が用意されていますが、2種類のインターフェースに沿った関数群が多くを占めます。
##deferred timeout interface
第一引数に時間を指定して実行する。指定した時間に関連した時間後にresolveするjQuery.Deferred.Promiseオブジェクトを返す。
##deferred interval interface
第一引数に時間を指定して実行する。指定した時間に関連した時間後にnotifyするjQuery.Deferred.Promiseオブジェクトを返す。
この関数はresolveになることが無く、clearによるrejectのみが停止手段となります。

#関数仕様(時間系)
    $.deferredTimeout(time)
    .done(function(){ /* action */});
の様にDeferredを返す為、Deferredチェーンを行って使用します。

尚、各関数には $. 版と $.fn. 版の両方があり、$.fn. 版だとDeferred呼び出し時のthis がその要素自身になります。
##.deferredTimeout(time)
setTimeout(callback,time) による deferred timeout interface の実装。指定する時間はmsを単位とする。

setTimeoutによる実装な為処理が溜まっていると遅延する動作となる。

##.deferredIntervalTimeout(time)
setInterval(callback,time) による deferred timeout interface の実装。指定する時間はmsを単位とする。

setIntervalによる実装な為、厳密に指定時間に実行しようとするところは重要である。

##.deferredFrameTimeout(time)
requestAnimationFrame(callback) による deferred timeout interface の実装。指定する時間はmsを単位とする。

フレーム単位で呼ばれ、指定の時間後の最初に呼ばれた際にresolveになる為、次のフレーム描画で動作を行いたい場合は有用である。

##.deferredInterval(time)
setInterval(callback,time) による deferred interval interface の実装。指定する時間はmsを単位とする。

setIntervalによる実装な為、厳密に指定時間間隔でnotifyが欲しい場合には有用である。

##.deferredTimeoutInterval(time)
setTimeout(callback,time) による deferred interval interface の実装。指定する時間はmsを単位とする。

setTimeoutによる実装な為、処理が溜まると後に後に遅れる。

##.deferredFrameInterval(time)
requestAnimationFrame(callback) による deferred interval interface の実装。指定する時間はmsを単位とする。

フレーム単位で呼ばれ、指定の時間後の最初に呼ばれるとnotifyする為、フレーム間隔で呼びたい場合に有用である。

#関数仕様(jQuery Utility系)
jQueryに用意されている関数をDeferred対応させた物。これも例に漏れず、戻り値のjQuery.Deferred.Promiseにclear関数が追加されており、それを実行することで強制的にキャンセルすることが出来る。

##.deferredEach(arry,fn(key,value))
.eachをDeferred対応させた物。

コールバック関数 fn の戻り値としてはfalseかjQuery.Deferred.Promiseオブジェクトを使用する事が出来る。falseを使用した場合は即時途中キャンセルとされ、rejectされる。fnの戻り値としてjQuery.Deferred.Promiseオブジェクトを使用した場合、次の要素をfnにより実行する迄の間を遅延させることが出来る。尚、jQuery.Deferred.Promiseをrejectされるとキャンセルされ、resolveされると続行する。配列を処理しつつDeferredで一繋ぎに処理することが出来る為、順次処理の必要がある場合の利用が見込まれる。

また、jQueryの要素から呼ばれる場合は第一引数を不要とする。

※例:

    $(elms).dferredEach(function(k,v){/* action */})
    .done(function(){/* ok action */}))
##.deferredMap(arry,fn(value,key))
.mapをDeferred対応させた物。 コールバック関数の戻り値として、指定なしと値、jQuery.Deferred.Promiseオブジェクトを使用する事が出来る。戻り値がある場合はその戻り値を配列に追加する。戻り値がjQuery.Deferred.Promise だった場合はそれのresolve時の引数を配列に追加する。実際の引数に対しての動作に関しては $.when と同等であるが、完了時の引数は全ての戻り値を再配列化(もしも配列が返された時はその配列一つ一つを要素として全体の配列に追加する)して第一引数に設定したresolveを行う。
##.deferredGrep(arry,fn(value,key),inv)
.grepをDeferred対応させた物。コールバック関数の戻り値として、指定なしと真偽値、jQuery.Deferred.Promiseオブジェクトを使用することが出来る。.grepだとfnの戻り値によってarryの取り込む値を指定するが、jQuery.Deferred.Promiseオブジェクトを指定した場合はそのresolveをtrueの代わりとし、rejectをfalseの代わりにとして使用することが出来る。勿論本来の.grepと同様に第三引数のinvに真を指定することでその指定は逆となる。
Ajaxなどで利用して失敗した物のみを別途処理する時や成功した物のみを別途処理する時の利用が見込まれる。
また、jQuery.grep と同様に jQuery.fn.deferredGrepは用意されていない。