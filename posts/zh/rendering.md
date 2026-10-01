---
title: "比較 Web Server、後端、與各種渲染方式"
date: "2026-07-21"
excerpt: "實習的回憶"
sections: ["tech"]
categories: ["web"]
tags: ["Client-Side Rendering", "Server-Side Rendering", "Static Site Generation", "Next.js"]
---

我大約 2020 附近第一次在實習的地方開發 web app，那時前後端分離、cloud 的概念剛出來，我們前端用 React，後端用 Spring Boot，我對於 React 開發完之後如何把 app 弄上線還很沒有概念

而且 React 基本上是個把 SPA、CSR、UI Component 化全部融在一起實現的東西；Spring Boot 則是一個後端框架，但它包含了 Web Server、MVC 等概念，也讓我對前端、後端、Web Server 的職責感到很困惑

這篇文章會先討論前後端的分工、Web Server 與 Application Server 的不同，接著比較不同的網頁渲染方式，並用 Next.js 舉例

## 前後端分離

一般人大概會聽到網路上的教學說前端就是負責把 UI 弄得美美的，大概用的就是 React、Vue、Angular；後端就是「Server」，負責處理 app 背後混亂的程序與邏輯，用的是 Node、Java、Python 等程式語言。這樣沒錯，但我認為這樣有把 server 這個概念簡化了一點

只要有一台主機上面的一個 process 開著，負責處理 request，就可以叫他 server

- **Application Server**：我們印象中的「後端」，似乎是跟 **Express、Spring Boot、Flask、Django** 這樣常見的 framework 為伍，這種框架包著的東西（**Tomcat**）、額外接的東西（**Gunicorn**），以下會稱為 Application Server
- **Web Server**：實際上有另一種 server 是在前後端分離這個框架下不會被提到的，以下稱為 Web Server。常見的有 **Nginx** 跟 **Apache**，負責處理靜態資源、cache、load balancing、reverse proxy

| 判斷指標 | Web Server (Nginx) | Application Server (後端) |
| --- | --- | --- |
| **會不會碰資料庫？** | 不會 | 會 |
| **處理對象** | 網路連線、憑證、檔案、IP、流量 | 商業邏輯、JSON 資料、身分權限 |
| **常見設定/語言** | Nginx 設定檔（`nginx.conf`） | Node.js, Java, Python, Go 程式碼 |

**結論**：我認為前後端分離這件事，用「前端 + Web Server + Application Server」來理解比較好，但目前是有分工逐漸模糊的現象

## Reverse Proxy

Web Server 拿到 HTTP request，解析後從 Application Server 拿東西，這個動作就叫 reverse proxy

### 為啥要叫 reverse proxy？那「正向」的 proxy 是什麼？

正向的 proxy 舉個例子，就是公司網管架的一台 server，公司電腦發出的 request 都得經過這台 server，以此達到：

- 設定白名單，防止連上可疑網站
- 監控流量、下載記錄
- 設定 cache

此時的 proxy 等於是**隱去了個別電腦的身分**，使公司電腦都透過 proxy 連上網路，稱為**正向 proxy**

Reverse Proxy，另一方面，因為**隱去的是 application server 的身分**，故稱為 reverse proxy。Reverse / 不 reverse 跟方向沒什麼關係，他只是在強調 **proxy 為誰服務而已**

| | 隱去誰的身分 | 例子 |
| --- | --- | --- |
| **正向 Proxy** | 個別電腦（client） | 公司電腦都透過 proxy 連上網路 |
| **Reverse Proxy** | Application Server | 使用者只看得到 Nginx，看不到背後的後端 |

以下放一個 Nginx 處理 route 的設定檔範例，未來有機會再寫一篇介紹 Nginx 操作與設定：

```nginx
server {
    listen 80;
    server_name mywebsite.com;

    # 路由 A：如果網址是 /api 開頭，轉發給後端 A 伺服器（reverse proxy）
    location /api {
        proxy_pass http://backend-server-node:3000;
    }

    # 路由 B：如果網址是 /images 開頭，就去硬碟抓圖片
    location /images {
        root /data/static;
    }

    # 路由 C：其他所有請求，回傳 React SPA
    location / {
        root /data/frontend-build;
        try_files $uri $uri/ /index.html;
    }
}
```

## Web App 發展歷史

| 時期 | 主流方式 | 代表技術 |
| --- | --- | --- |
| 1990–2010 | SSR | HTML/CSS/JS + PHP、Java (JSP)、ASP.NET |
| 2012–2018 | CSR、SPA、前後端分離 | React / Vue / Angular + Backend |
| 2018–現在 | Full-Stack App、React Server Component、Serverless / PaaS | Next.js + Vercel / Cloudflare |

## Client-Side Rendering

Browser 向 server 要一個 HTML 的殼，並根據 JS 拿資料、填入畫面

**優點：**

- **減輕 server 負擔**：從前的 server（Application Server）會需要把資料撈好並組成完整的 HTML，CSR 把繪出畫面這件事交給了瀏覽器
- **後續瀏覽快**：除了第一次開啟要下載較大的 JS 檔，後續的瀏覽速度快

### CSR vs. SPA

CSR 常會被跟 SPA（Single Page Application）講在一起：

- **CSR** 講的是「畫面出現的方式」
- **SPA** 則較多在描述 app 的架構，強調「不重新整理、維持流暢的互動體驗」

如果列出 SPA 的優點來跟 CSR 比較，可能會較容易了解：

- 像 app 一樣流暢的使用體驗，無須反覆要新的 HTML，畫面瞬間響應
- 使前後端徹底解耦

CSR 減輕 server 負擔，SPA 使使用者體驗流暢

## Server-Side Rendering

從前的 Application Server（PHP、Java 等）會需要把資料撈好並組成完整的 HTML，稱為 Server-Side Rendering。當時的 Spring、ASP.NET、Django 等會支援如 [MVC、MVVM](https://ithelp.ithome.com.tw/articles/10266737) 這樣的開發模式，後端需要一定程度地負責 UI

這樣的缺點也很明顯：只要有資料需要更新，就必須重畫、重新要一個 HTML，對 server 的負擔大。因此 CSR 就跳出來接管 UI，也催生了前後端分離的架構

![傳統 SSR：溪埕國民小學失蹤事件](https://res.cloudinary.com/dazoegq66/image/upload/v1790746648/rendering/early_2000s_school_website.png)

直到 CSR 的一些缺點開始顯現，包括：

- JS bundle 過大，初次 loading 太慢
- SEO 毀滅：爬蟲不一定會執行 JS，拿到的可能只有一個空殼 HTML
- 低階裝置跑不動

才發展出如 Next.js、React Server Component 等東西，現在是一個 SSR 與 CSR 混合使用的時代

常見的 flow 會是：

1. 第一次載入網頁採取 SSR，拿到已經有內容的 HTML（layout、能幫助 SEO 的內容），使用者馬上就看得到畫面
2. 接著下載 JS，把事件與 state 掛到這份現成的 HTML 上，讓它變得可以互動，這個步驟叫 **hydration**
3. 之後的換頁、互動就交給 CSR 處理

## Build 與 Deploy 一個 Next.js App

應該多數人第一次寫了 Next.js 後，就會照著官方文件的說明一鍵 push 到 GitHub 上，然後用 Vercel 來 host 他吧

但如果是比較具有規模的專案，我們可能會想要把他 host 在：

- **Docker 容器化部署**：AWS ECS、Google Cloud Run、Azure
- **傳統 VPS 主機**：Linode 之類的 + Nginx
- **PaaS 平台**：Render、Fly.io、Railway、AWS Amplify

如何在這三者間選擇，之後有機會再寫一篇關於 deploy 的文章討論

你可能會想說，不管是 Vercel 或這些平台，他們是如何做到 CSR 與 SSR 的呢？我們可以在 Next 專案中執行 `npm run build`，他會產生 `.next` 資料夾。此時執行 `npm run start`，就會有一個 Node server 開起來，就可以連到你的電腦用了

![Build 完出現的 .next 資料夾](https://res.cloudinary.com/dazoegq66/image/upload/v1790760765/rendering/nextjs_build_output_folder.png)

可以注意到 `.next` 資料夾中有 `server` 跟 `static` 兩個資料夾：

- **`server`**：server 端要執行的程式碼（負責 SSR 與 API Route），以及 build 時就預先渲染好的 HTML
- **`static`**：會被送到瀏覽器的靜態資源，例如負責 CSR 與 hydration 的 JS、CSS 檔案

而 `npm run start` 開起來的那個 Node server，會同時做兩件事：

- 執行 `server` 裡的程式碼，處理 SSR 與 API → 扮演 **Application Server**
- 把 `static` 裡的檔案直接回給瀏覽器 → 扮演 **Web Server**

換句話說，**Next.js 就是一個能做到前端 + Web Server + Application Server 工作的框架**

這些功能並非全部都要用到才是個好的 app。當我們基於效能、維護、架構等等理由，可以把任何一個功能模組抽出來，例如：

- 把分發靜態資源的工作交給 Nginx 或 CDN
- 把資料庫讀寫或 authentication 交給另一個後端 app
- 只想把他當 React 用，而使用 [Static Export](https://nextjs.org/docs/app/guides/static-exports)，就像以前 [create-react-app](https://create-react-app.dev/docs/getting-started/) 的 build 一樣

## Static Site Generation

在 `npm run build` 時就把頁面預先渲染成 HTML（放在 `.next/server` 底下），之後有 request 進來直接回這份現成的 HTML，不用每次都重新 SSR，速度較快，適用於所有人看都一樣、不會頻繁改變的內容

在 Next.js 的 App Router 中，只要頁面沒有用到 `cookies()`、`headers()`、`searchParams` 這類「每個 request 都不一樣」的東西，build 時就會自動變成 SSG，連裡面的 `fetch` 也會在 build 時執行一次

## Incremental Static Regeneration

在 SSG 之上，允許需要更新的資料在背景更新，而不用資料一變就要重新 build 一次。Next.js 16 中，先在 `next.config.ts` 開啟 `cacheComponents: true`，再用 `'use cache'` 搭配 `cacheLife()` 決定哪些資料或 component 要快取、多久在背景更新一次：

```ts
import { cacheLife } from 'next/cache'

export async function getPost() {
  'use cache'
  cacheLife('minutes') // 快取的資料大約每 1 分鐘會在背景更新一次
  const res = await fetch('https://api.example.com/post')
  return res.json()
}
```

**範例場景：**

- 電商商品列表與價格頁（可能幾分鐘就更新一次）
- 大型新聞網站（修錯字不用重新 build）

## 總結

| 渲染方式 | HTML 在什麼時候產生 | 在哪裡產生 | 適用場景 |
| --- | --- | --- | --- |
| **CSR** | 每次在瀏覽器執行 JS 時 | 瀏覽器 | 後台、Dashboard 等登入後才看得到、不需要 SEO 的頁面 |
| **SSR** | 每個 request 進來時 | Server | 每個人看到的內容不同、又需要 SEO 的頁面 |
| **SSG** | `npm run build` 時 | Build 環境 | 部落格、文件、Landing Page |
| **ISR** | Build 時，之後定期在背景重新產生 | Server | 電商商品頁、新聞網站 |

Frontend / backend、Web / Application Server、CSR / SSR 都是 web 不斷發展下的產物。雖然有各自的定義，但現在經常是要一起用，或者混著用的。熟悉他們的相同與不同處，才能在開發時決定架構與要採取的技術

## Reference

- [[基礎觀念系列] Web Server & Nginx — (1)](https://medium.com/starbugs/web-server-nginx-1-cf5188459108)
- [Deploying](https://nextjs.org/docs/app/getting-started/deploying)
- [Caching | Next.js](https://nextjs.org/docs/app/getting-started/caching)
