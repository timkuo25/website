---
title: "Web Server、バックエンド、各種レンダリング方式の比較"
date: "2026-07-21"
excerpt: "インターン時代の思い出"
sections: ["tech"]
categories: ["web"]
tags: ["Client-Side Rendering", "Server-Side Rendering", "Static Site Generation", "Next.js"]
---

2020 年ごろ、インターン先で初めて Web アプリを開発しました。当時はフロントエンドとバックエンドの分離やクラウドといった概念が広まり始めたばかりで、フロントエンドは React、バックエンドは Spring Boot を使っていました。React で開発し終えたアプリをどうやって公開するのか、まったくイメージが湧いていませんでした。

しかも React は SPA、CSR、UI のコンポーネント化をすべて一体化して実現しているようなものです。一方 Spring Boot はバックエンドフレームワークですが、Web Server や MVC といった概念も含んでいます。そのせいで、フロントエンド・バックエンド・Web Server それぞれの役割がよくわからなくなっていました。

この記事では、まずフロントエンドとバックエンドの役割分担、Web Server と Application Server の違いについて説明し、次にさまざまな Web レンダリング方式を比較して、Next.js を例に解説します。

## フロントエンドとバックエンドの分離

ネット上のチュートリアルでは、だいたいフロントエンドは UI をきれいに作る役割で、React、Vue、Angular などを使い、バックエンドは「サーバー」としてアプリの裏側にある複雑な処理やロジックを担当し、Node、Java、Python などの言語を使う、と説明されています。間違ってはいないのですが、サーバーという概念を少し単純化しすぎていると思います。

マシン上で request を処理する process が動いていれば、それはサーバーと呼べます。

- **Application Server**：私たちがイメージする「バックエンド」は、**Express、Spring Boot、Flask、Django** といった一般的なフレームワークとセットになっているようです。これらのフレームワークに内包されているもの（**Tomcat**）や、別途組み合わせるもの（**Gunicorn**）を、以下では Application Server と呼びます。
- **Web Server**：実は、フロントエンドとバックエンドの分離という枠組みではあまり語られない、もう一種類のサーバーがあります。以下では Web Server と呼びます。代表的なものは **Nginx** と **Apache** で、静的リソース、キャッシュ、ロードバランシング、リバースプロキシを担当します。

| 判断基準 | Web Server (Nginx) | Application Server（バックエンド） |
| --- | --- | --- |
| **データベースに触れるか？** | 触れない | 触れる |
| **扱う対象** | ネットワーク接続、証明書、ファイル、IP、トラフィック | ビジネスロジック、JSON データ、認証・権限 |
| **主な設定/言語** | Nginx 設定ファイル（`nginx.conf`） | Node.js, Java, Python, Go のコード |

**結論**：フロントエンドとバックエンドの分離は、「フロントエンド + Web Server + Application Server」として理解するほうがわかりやすいと思います。ただし、現在はその役割分担が徐々に曖昧になってきています。

## Reverse Proxy

Web Server が HTTP request を受け取り、解析したうえで Application Server からデータを取ってくる。この動作を reverse proxy と呼びます。

### なぜ reverse proxy と呼ぶのか？では「フォワード」の proxy とは？

フォワードプロキシの例としては、会社のネットワーク管理者が設置するサーバーがあります。会社のパソコンから送られる request はすべてそのサーバーを経由する必要があり、それによって次のことが実現できます：

- ホワイトリストを設定して、怪しいサイトへの接続を防ぐ
- トラフィックの監視、ダウンロード記録
- キャッシュの設定

このときの proxy は、いわば**個々のパソコンの身元を隠し**、会社のパソコンが proxy を通じてインターネットに接続できるようにしています。これを**フォワードプロキシ**と呼びます。

一方 Reverse Proxy は、**Application Server の身元を隠す**ことから reverse proxy と呼ばれます。Reverse かどうかは方向とはあまり関係なく、**proxy が誰のために働いているか**を強調しているだけです。

| | 誰の身元を隠すか | 例 |
| --- | --- | --- |
| **フォワードプロキシ** | 個々のパソコン（client） | 会社のパソコンがすべて proxy を通じてインターネットに接続する |
| **Reverse Proxy** | Application Server | ユーザーには Nginx しか見えず、裏にあるバックエンドは見えない |

以下は Nginx でルーティングを処理する設定ファイルの例です。Nginx の操作と設定については、いつか別の記事で紹介したいと思います：

```nginx
server {
    listen 80;
    server_name mywebsite.com;

    # ルート A：URL が /api で始まる場合、バックエンド A サーバーに転送する（reverse proxy）
    location /api {
        proxy_pass http://backend-server-node:3000;
    }

    # ルート B：URL が /images で始まる場合、ディスクから画像を取得する
    location /images {
        root /data/static;
    }

    # ルート C：それ以外のすべてのリクエストには React SPA を返す
    location / {
        root /data/frontend-build;
        try_files $uri $uri/ /index.html;
    }
}
```

## Web アプリの歴史

| 時期 | 主流の方式 | 代表的な技術 |
| --- | --- | --- |
| 1990–2010 | SSR | HTML/CSS/JS + PHP、Java (JSP)、ASP.NET |
| 2012–2018 | CSR、SPA、フロントエンドとバックエンドの分離 | React / Vue / Angular + Backend |
| 2018–現在 | Full-Stack App、React Server Component、Serverless / PaaS | Next.js + Vercel / Cloudflare |

## Client-Side Rendering

ブラウザがサーバーに HTML の枠だけを要求し、JS でデータを取得して画面を埋めていきます。

**メリット：**

- **サーバーの負担を減らす**：以前のサーバー（Application Server）はデータを取得して完全な HTML を組み立てる必要がありましたが、CSR は画面を描画する作業をブラウザに任せました。
- **2 回目以降の閲覧が速い**：初回アクセス時に大きめの JS ファイルをダウンロードする必要がありますが、それ以降の閲覧は高速です。

### CSR vs. SPA

CSR はよく SPA（Single Page Application）と一緒に語られます：

- **CSR** は「画面がどのように表示されるか」の話
- **SPA** はどちらかというとアプリのアーキテクチャを表し、「リロードせずに、スムーズなインタラクションを保つ」ことを重視している

SPA のメリットを CSR と並べて比べると、わかりやすいかもしれません：

- アプリのようにスムーズな使い心地。新しい HTML を何度も要求する必要がなく、画面が即座に反応する
- フロントエンドとバックエンドを完全に疎結合にする

CSR はサーバーの負担を減らし、SPA はユーザー体験をスムーズにします。

## Server-Side Rendering

以前の Application Server（PHP、Java など）は、データを取得して完全な HTML を組み立てる必要があり、これを Server-Side Rendering と呼びます。当時の Spring、ASP.NET、Django などは [MVC、MVVM](https://ithelp.ithome.com.tw/articles/10266737) のような開発パターンをサポートしており、バックエンドもある程度 UI を担う必要がありました。

この方式の欠点も明らかです。データを更新するたびに画面を描き直し、新しい HTML を要求しなければならないため、サーバーの負担が大きくなります。そこで CSR が UI を引き受けるようになり、フロントエンドとバックエンドを分離するアーキテクチャが生まれました。

![従来の SSR：溪埕国民小学失踪事件](https://res.cloudinary.com/dazoegq66/image/upload/v1790746648/rendering/early_2000s_school_website.png)

ところが、CSR にもいくつかの欠点が見えてきました：

- JS bundle が大きすぎて、初回ロードが遅い
- SEO が壊滅：クローラーが JS を実行するとは限らず、空の HTML の枠しか取得できない可能性がある
- 低スペックな端末では動作が重い

こうして Next.js や React Server Component などが生まれ、現在は SSR と CSR を組み合わせて使う時代になっています。

よくある流れは次のとおりです：

1. 初回ロードでは SSR を使い、すでに内容が入った HTML（レイアウト、SEO に役立つコンテンツ）を受け取るので、ユーザーはすぐに画面を見られる
2. 次に JS をダウンロードし、イベントや state をこの出来上がった HTML に結びつけてインタラクティブにする。このステップを **hydration** と呼ぶ
3. その後のページ遷移や操作は CSR が担当する

## Next.js アプリの Build と Deploy

多くの人は、初めて Next.js を書いたあと、公式ドキュメントの説明どおりにワンクリックで GitHub に push し、Vercel でホスティングしているのではないでしょうか。

しかし、ある程度の規模のプロジェクトになると、次のような場所でホスティングしたくなるかもしれません：

- **Docker コンテナでのデプロイ**：AWS ECS、Google Cloud Run、Azure
- **従来型の VPS**：Linode など + Nginx
- **PaaS プラットフォーム**：Render、Fly.io、Railway、AWS Amplify

この三つの中からどう選ぶかについては、いつかデプロイに関する記事で議論したいと思います。

Vercel やこれらのプラットフォームは、どうやって CSR と SSR を実現しているのだろうと思うかもしれません。Next のプロジェクトで `npm run build` を実行すると、`.next` フォルダが生成されます。そのあと `npm run start` を実行すると Node サーバーが立ち上がり、自分のパソコンに接続して使えるようになります。

![Build 後に生成される .next フォルダ](https://res.cloudinary.com/dazoegq66/image/upload/v1790760765/rendering/nextjs_build_output_folder.png)

`.next` フォルダの中に `server` と `static` という二つのフォルダがあることに注目してください：

- **`server`**：サーバー側で実行されるコード（SSR と API Route を担当）と、build 時に事前レンダリングされた HTML
- **`static`**：ブラウザに送られる静的リソース。たとえば CSR や hydration を担当する JS、CSS ファイル

そして `npm run start` で立ち上がる Node サーバーは、同時に二つの仕事をこなします：

- `server` 内のコードを実行して SSR と API を処理する → **Application Server** の役割
- `static` 内のファイルをそのままブラウザに返す → **Web Server** の役割

つまり、**Next.js はフロントエンド + Web Server + Application Server の仕事をこなせるフレームワーク**なのです。

これらの機能をすべて使わなければ良いアプリにならない、というわけではありません。パフォーマンス、メンテナンス、アーキテクチャなどの理由から、どの機能でも切り出すことができます。たとえば：

- 静的リソースの配信を Nginx や CDN に任せる
- データベースの読み書きや authentication を別のバックエンドアプリに任せる
- React としてだけ使いたい場合は [Static Export](https://nextjs.org/docs/app/guides/static-exports) を使う。昔の [create-react-app](https://create-react-app.dev/docs/getting-started/) の build と同じような感覚で使える

## Static Site Generation

`npm run build` の時点でページを HTML として事前レンダリングしておき（`.next/server` 配下に保存）、request が来たらこの出来上がった HTML をそのまま返します。毎回 SSR をやり直す必要がないので高速で、誰が見ても同じ内容で、頻繁に変わらないコンテンツに向いています。

Next.js の App Router では、ページが `cookies()`、`headers()`、`searchParams` のような「request ごとに異なる」ものを使っていなければ、build 時に自動的に SSG になり、中の `fetch` も build 時に一度だけ実行されます。

## Incremental Static Regeneration

SSG をベースに、更新が必要なデータをバックグラウンドで更新できるようにしたもので、データが変わるたびに build し直す必要がありません。Next.js 16 では、まず `next.config.ts` で `cacheComponents: true` を有効にし、`'use cache'` と `cacheLife()` を組み合わせて、どのデータや component をキャッシュするか、どのくらいの頻度でバックグラウンド更新するかを決めます：

```ts
import { cacheLife } from 'next/cache'

export async function getPost() {
  'use cache'
  cacheLife('minutes') // キャッシュされたデータはおよそ 1 分ごとにバックグラウンドで更新される
  const res = await fetch('https://api.example.com/post')
  return res.json()
}
```

**利用シーン：**

- EC サイトの商品一覧や価格ページ（数分ごとに更新されることもある）
- 大規模なニュースサイト（誤字を直すたびに build し直さなくてよい）

## まとめ

| レンダリング方式 | HTML が生成されるタイミング | 生成される場所 | 利用シーン |
| --- | --- | --- | --- |
| **CSR** | ブラウザで JS を実行するたび | ブラウザ | 管理画面、ダッシュボードなど、ログイン後にしか見えず SEO が不要なページ |
| **SSR** | request が来るたび | サーバー | ユーザーごとに内容が異なり、かつ SEO が必要なページ |
| **SSG** | `npm run build` 時 | Build 環境 | ブログ、ドキュメント、ランディングページ |
| **ISR** | Build 時、その後バックグラウンドで定期的に再生成 | サーバー | EC サイトの商品ページ、ニュースサイト |

フロントエンド / バックエンド、Web / Application Server、CSR / SSR は、どれも Web が進化し続ける中で生まれたものです。それぞれに定義はありますが、現在では一緒に使ったり、混ぜて使ったりすることがよくあります。それぞれの共通点と違いを理解してこそ、開発時にアーキテクチャや採用する技術を決められるのです。

## Reference

- [[基礎觀念系列] Web Server & Nginx — (1)](https://medium.com/starbugs/web-server-nginx-1-cf5188459108)
- [Deploying](https://nextjs.org/docs/app/getting-started/deploying)
- [Caching | Next.js](https://nextjs.org/docs/app/getting-started/caching)
