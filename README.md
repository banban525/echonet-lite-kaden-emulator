# echonet-lite-kaden-emulator


[![MIT License](https://img.shields.io/github/license/banban525/echonet-lite-kaden-emulator)](LICENSE)
[![github build](https://img.shields.io/github/workflow/status/banban525/echonet-lite-kaden-emulator/Build%20and%20Publish%20Docker)](https://github.com/banban525/echonet-lite-kaden-emulator/actions/workflows/action.yml)
[![Docker Hub](https://img.shields.io/docker/pulls/banban525/echonet-lite-kaden-emulator)](https://hub.docker.com/r/banban525/echonet-lite-kaden-emulator)

仮想的な家電を制御できるECHONET Liteのエミュレータです。

## 説明

ブラウザ上で操作することで仮想的な家電を操作でき、その状態をUDPのECHONET Lite規格で公開します。
また、UDP経由のECHONET Liteプロトコルで制御することもできます。

![preview](example/preview.jpg)



対応している機器は以下です。
* シーリングライト (ECHONET Liteクラス:0x0291 単機能照明)
* 温度計 (ECHONET Liteクラス:0x0011 温度センサ)
* 湿度計 (ECHONET Liteクラス:0x0012 湿度センサ)
* モーションセンサー (ECHONET Liteクラス:0x0007 人体検知センサ)
* フロアライト (ECHONET Lite クラス:0x0290 一般照明)
* 電動シャッター (ECHONET Liteクラス:0x0263 電動雨戸・シャッター)
* 電気錠 (ECHONET Liteクラス:0x026f 電気錠, 0x05fd スイッチ（JEM-A / HA 端子対応）)
* エコキュート (ECHONET Liteクラス:0x026b 電気温水器)
* エアコン (ECHONET Liteクラス:0x0130 家庭用エアコン)

ECHONET Liteの仕様としては、[APPENDIX ECHONET機器オブジェクト詳細規定Release P](https://echonet.jp/spec_object_rp/) に従うようにしています。
ただ、必須のプロパティは実装しましたが、基本的な機能しか対応していません。

ECHONET Liteのエミュレータと言えば、 [MoekadenRoom](https://github.com/SonyCSL/MoekadenRoom) が有名ですが、
こちらは、やや仕様が古いのと、必要な家電がそろっていなかったので、新たに作っています。

なお、GitHubは英語でReadmeやコミットコメントを書くべきだとは思いますが、
ECHONET Liteは日本でしか使われてなさそうなので、基本日本語で書きます。

## 使用方法

### dockerで動作させる

実行には以下が必要です。
* docker (ver.20以降推奨)

(1) dockerでechonet-lite-kaden-emulatorを起動します。

ECHONET Liteは1つのIPで1つのノードしか稼働できません。(1-a)PC外にECHONET Liteを公開してdockerのホストPCをノードにする方法と、
(1-b)docker内ネットワークにECHONET Liteを公開してdocker containerをノードにする方法があります。

(1-a)PC外にECHONET Liteを公開する場合

```
docker run -d --net=host banban525/echonet-lite-kaden-emulator:latest
```

この方法は、ネットワーク内に複数台のPCや仮想PCがある環境で、それぞれのPCをECHONET Liteのノードにする場合に使用します。


(1-b)docker内ネットワークにECHONET Liteを公開する場合

```
docker run -d -p 3000:3000 banban525/echonet-lite-kaden-emulator:latest
```

この方法は、1つのPC内で複数のECHONET Liteのノードを構築する場合に使用します。
例えば、echonet-lite-kaden-emulatorを1つのPC内で複数立ち上げて、複数ノードの実験を1つのPCで行うこともできます。(なお、外部公開ポートは変更する必要があります)

(2) ブラウザで、 `http://<docker server>:3000/` にアクセスします。

環境変数

* `ECHONET_TARGET_NETWORK`
  ECHONET Liteを公開するネットワークを xxxx.xxxx.xxxx.xxx/xx (例: 192.168.1.0/24) の形式で指定します。
  ノードにIPが複数ある場合、想定しているネットワークとは別のネットワークにECHONET Liteが公開されてしまう場合があります。
  未指定では自動でIPv4のアドレスが選択されますが、公開先ネットワークを指定する場合は設定します。

### Node.jsで動作させる

実行には以下が必要です。
* Node.js (ver.14以降推奨)

以下の手順で動作させることができます。

(1) リポジトリをCloseします

(2) 依存モジュールをインストールします。(初回のみ)
```
npm install
```
(3) フロントエンドをビルドします。(初回のみ)
```
npm run build
```

(4) サーバーを開始します。
```
npm start
```

(5) ブラウザで、 http://localhost:3000/ にアクセスします。

(6) 終了にするには、Ctrl+Cを入力してください。

## 開発方法

通常の `npm start` での実行の他にフロントエンドだけを開発モードで起動することができます。
Create-React-Appを使用しているため、ソースコードの変更がすぐに反映されます。

バックエンドを `npm start` で起動した後、以下のコマンドで開発モードのフロントエンドを起動してください。

```
npm run start-react
```


## サードパーティの使用

* アプリケーション内の画像は、 [いらすとや](https://www.irasutoya.com/) 様の素材を使用しています。

## ライセンス

[MIT](LICENSE)

## Author

[banban525](https://github.com/banban525)

