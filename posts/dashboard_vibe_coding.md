---
title: "工作紀錄 dashboard"
date: "2026-05-19"
excerpt: "還敢 vibe coding"
---

紀錄一下搞一個工作 dashboard 的過程

## 需求：

1. 全端 app，要有按鈕可以加、改、刪工作記錄
2. 要能記錄我的三個工作類型：解 Bug、刻 UI、小雜事
3. 要有圖表跟深色背景，像 B 格特高的 Dashboard
4. 要有 API，讓其他工具（AI Agent、n8n 之類的）也能直接呼叫

---

## Tech Stack

- 前端：Next.js、API route，沒特別弄後端（也許有天會弄）
- 資料庫：Prisma（ORM）+ PostgreSQL + Neon + Docker(for dev) 。欄位滿清楚的所以也先不考慮 noSQL

Schema：

```
WorkEntry
  type: BUG | UI | MISC
  ├── BugEntry   → bugUrl, description, difficulty, customer, branch
  ├── UIEntry    → figmaUrl, clientName, difficulty, customer, branch
  └── MiscEntry  → description, difficulty, customer, branch
```

API：

| Method | 路徑 | 說明 | 外部呼叫 |
|--------|------|------|----------|
| GET | `/api/entries?weekStart=YYYY-MM-DD` | 取得某週的所有記錄 |  |
| POST | `/api/entries` | 新增記錄 | ✓ |
| GET | `/api/entries/[id]` | 取得單筆記錄 | |
| PATCH | `/api/entries/[id]` | 編輯記錄 | ✓ |
| DELETE | `/api/entries/[id]` | 刪除記錄 | ✓ |
| GET | `/api/stats?weekStart=YYYY-MM-DD` | 週統計（各類型數量、難度分布） |  |
| GET | `/api/stats?all=true` | 全時段統計 |  |

---

## Project Structure

```
app/
  layout.tsx
  page.tsx              # 首頁
  week/[weekStart]/     # 週頁面
  entries/[id]/         # 單筆 entry 頁
  api/
    entries/            # 新增、編輯、刪除記錄
    stats/              # 統計資料（各類型數量、難度分布）

components/             # UI 元件

lib/
  prisma.ts             # DB client
  week.ts               # 週的起訖計算
```

Next.js 利用目錄結構來做 routing

`layout.tsx` 像是殼，用來放頁面的共用資訊。子頁面，也就是 `page.tsx`，會透過 `children` 插入。在目錄下加 `page.tsx` 就能讓那個目錄的 route public accessible

目錄的名字加中括號 [] 就是 Next.js 的 dymamic routing。透過 `page.tsx` 的 `param` 來存取，根據資料渲染不同頁面

定義好 route 後便能用 `<Link>` 元件來 navigate

```javascript
<Link
  href={`/week/${weekStart}`}
>
  ← Back
</Link>
```

在目錄（通常是 `/api`）底下加 `route.ts`，就會變成一個 API endpoint
在裡面定義 `GET` / `POST` 等 function，API 就做好啦！Vercel 還會直接處理好部署，很簡單吧（根本就超難）

```javascript
export async function GET(req: NextRequest) {
  ...
  return NextResponse.json(...);
}
```

在本地開發時用一個 Docker Container 當臨時的資料庫

```yaml
services:
  db:
    image: postgres:16
    container_name: dashboard-db
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: dashboard
    ports:
      - "5432:5432"
    volumes:
      - dashboard_db_data:/var/lib/postgresql/data

volumes:
  dashboard_db_data:
```

- `image: postgres:16` — Base image
- `container_name: dashboard-db` — 給 container 取名，方便之後用 `docker stop dashboard-db` 操作
- `environment` — 設定資料庫的帳號、密碼、DB 名稱，Prisma 的 `DATABASE_URL` 會對應這些值
- `ports: "5432:5432"` — 把 container 內的 5432 port 對到本機的 5432，這樣本機的程式就能連進去
- `volumes` — 把資料存在 Docker 管理的 volume 裡，container 重啟後資料不會消失

`docker-compose up` 跑起來之後：
1. 去 Docker Hub 把 `postgres:16` image 抓下來（第一次才需要，之後用 cache）
2. 用那個 image 建 container，套用 `environment` 裡的設定初始化資料庫
3. 把 container 的 5432 port 綁到本機的 5432
4. PostgreSQL 開始監聽連線

這樣本機的 Next.js dev server 就能透過 `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/dashboard` 連進去

開始測試時只要下 `docker-compose up` 跟 `npm run dev` 即可開發
開發結束則是 Ctrl C 跟 `docker-compose down`，下次開發無須重新輸入資料

Production 版就是去弄雲端資料庫一些奇怪的設定，這裡就不贅述啦

弄完大概會長這樣
![初版成品](https://res.cloudinary.com/dazoegq66/image/upload/v1779243102/dashboard_1_ax1ibu.png)

---

## 功能擴充

### 月份折疊

entry 會越來越多，照月份折疊起來

### 裝飾

本來想把這個頁面搞得很有科技感，弄一些類似 Cyberpunk 或復古電玩元素的東西，試了幾個素材都覺得不太妥，最後只弄了一隻貓貓在角落（真羨慕美術強的人啊...）

### Search bar 與 Recent Branches

工作時很常遇到要解一個東西，branch 卻要找老半天的情況（我覺得這算公司系統的鍋了）
加上大家也知道 context switching 很煩，一來一往的就摩擦掉很多時間了

弄出一個 recent branches 區塊有很好的幫助到我更快找到最近弄過的 bug 與專案在哪個 branch，再加一個 search bar 也讓久一點的專案找起來比較快

Search 的部分用 live search + 1.5 秒 debouce
![Search Bar](https://res.cloudinary.com/dazoegq66/image/upload/v1779248381/dashboard_2_fji4ej.png)

search api
```javascript
  const entries = await prisma.workEntry.findMany({
    where: {
      OR: [
        { bugEntry: { branch:      { contains: q, mode: "insensitive" } } },
        { bugEntry: { customer:    { contains: q, mode: "insensitive" } } },
        { bugEntry: { description: { contains: q, mode: "insensitive" } } },
        { uiEntry:  { branch:      { contains: q, mode: "insensitive" } } },
        { uiEntry:  { customer:    { contains: q, mode: "insensitive" } } },
        { uiEntry:  { clientName:  { contains: q, mode: "insensitive" } } },
        { miscEntry: { branch:      { contains: q, mode: "insensitive" } } },
        { miscEntry: { customer:    { contains: q, mode: "insensitive" } } },
        { miscEntry: { description: { contains: q, mode: "insensitive" } } },
      ],
    },
    include: { bugEntry: true, uiEntry: true, miscEntry: true },
    orderBy: { date: "desc" },
    take: 50,
  });
```

### Authentication

我後來發現根本誰都可以來點這個網頁的按鈕來加 / 刪資料啊哈哈哈哈

因為這個工具只有我要用，可以自訂一個密碼弄成 Bearer token，讓 API 帶或登入頁，登入成功後設一個 http-only 的 cookie，之後用相同裝置就會保持登入了

這樣就完成了要登入之後才看的到變動 entry 的按鈕和特定資訊啦


![最終頁面](https://res.cloudinary.com/dazoegq66/image/upload/v1779274169/dashboard_3_bdtrkk.png)

我感覺下一次更新應該要每輸錯一次密碼就讓網站變得更詭異陰沉，然後 jump scare 之類的，直接從 dashboard 變恐怖遊戲

不過這些就以後再說吧


[連結](https://dashboard-ten-lemon-31.vercel.app/)