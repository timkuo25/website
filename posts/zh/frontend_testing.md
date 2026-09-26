---
title: "前端測試都是怎麼做的"
date: "2026-07-21"
excerpt: "Test Driven Developing (is dead?)"
sections: ["tech"]
categories: ["web"]
tags: ["Testing", "Vitest", "Playwright", "CI/CD"]
---

## 要測什麼

可能會有人跟我有一樣的疑問，前端的測試到底要怎麼做？是要確保所有 UI 在任何情況下都不會炸掉嗎？這樣的話怎麼可能做得完，世界上不同裝置、不同 Resolution 這麼多，哪可能顧到所有狀況？

那麼簡單的答案是的確不可能，確實也沒人測試的目的是把 UI 每個 pixel 都拉得完美無瑕。不過用 Playwright / Cypress 的截圖功能測個大概是辦得到的。那麼前端的測試究竟該測什麼呢？

我覺得這問題要從前端測試「是 / 不是什麼」跟「該 / 不該做什麼」了解起

## 原則

### Is/Isn't/Do/Don't

**前端測試「是」**

- 維護與重構的基礎：為了讓工程師維護 code 可以輕鬆一點，不至於改一個功能整個程式都壞掉
- 元件和函式的規格書：透過測試案例，定義一個元件或函式在各種 Input 下應該要有什麼對應的 Output 或行為
- 邏輯與行為的防線：確保商業邏輯、狀態流轉、API 呼叫與資料處理在多次迭代中依然正確無誤

**前端測試「不是」**

- 零 Bug 的萬靈丹：測試只能證明「你有測到的情境沒問題」，無法完全杜絕未預期的極端狀況或全新的 Bug
- 視覺與排版的審查員：單位/整合測試看不見真實畫面，不管 CSS 的 px 數或炸版，而且也管不完

**前端測試「應該」**

- 聚焦於「行為與狀態」：測試使用者點了什麼、什麼狀態改變、輸出什麼正確的資料（例如：點擊按鈕後計數器是否加 1）
- 優先覆蓋高風險與核心邏輯：把精力放在商業邏輯、複雜的資料處理函式、共用 Hook，以及容易出錯的表單與狀態機上
- 擁抱 80/20 法則：抓出最關鍵、最常出錯的路徑（Happy Path 與常見 Error Path）寫測試，達到最高的投資報酬率

**前端測試「不應該」**

- 綁死 CSS 數值與樣式細節：不要測「這個元件的寬度是不是 300px」、「顏色是不是某個 hex」、「這個版面有沒有炸掉」
- 寫垃圾測試：不測毫無邏輯的靜態 UI，或寫出為了湊數字而沒有實質斷言的測試


測試是寫不完的，因此要決定好範圍。那應該由誰決定？

最好的情況應該是團隊一起討論，或是根據 PM 給的業務需求來判斷哪些測試、哪些 edge case 是重要的

如果你老闆或主管就跟你說「這個東西要寫個測試」，但沒跟你說要測什麼（我就遇過這種事，他還丟了一本 Jtest 的書給我，到底誰會有時間看書），那你就有機會可以自己定義測試的範圍、想想哪些是重要的。當然如果他沒講的話，有機會這件事其實沒那麼重要，你是在做白工

可以從以下幾個方向開始：

- 把 Happy Path 跟常見的 Error Path 寫好
- 看一下 commit、Bug、Jira 或會議記錄看哪些東西是容易踩雷的
- 列一個大方向給你老闆或主管確認（上班要溝通！！）

## 三本柱

### Unit Test

測功能單純的 function，或 `utils/` 目錄裡的 function，不碰網路、DOM 或 DB，執行速度較快。例如：string formatter、密碼規則檢查、功能簡單的 React Hook

Unit Test 通常會發生在 component，React 生態系常把測試檔就寫在 component 旁邊：

```
src/
├── components/
│   └── Button/
│       ├── Button.tsx        # 你的元件
│       ├── Button.styles.ts  # 樣式
│       └── Button.test.tsx   # 👈 直接躺在旁邊的測試檔
├── utils/
│   ├── formatPrice.js        # 工具函式
│   └── formatPrice.test.js   # 👈 測試檔
```

你通常不用自己寫什麼「Button Disable 之後要不能按」這種針對 DOM 或 UI component 行為的測試，這些瀏覽器，或者你用的 Radix、Material UI、Ant Design 什麼的已經幫你寫好了。不過如果你在他們上面又包東西，或者按鈕按下去會觸發一些你 app 自己的邏輯，這個就需要自己寫了

### Integration Test

前端的整合測試會把元件們拼起來，確保一個大元件或 page 運作的功能是正常的。以登入表單來說，我們需要：

1. 把表單跟所有元件 render 出來
2. 填資料並送出（使用者互動）
3. 檢查畫面與行為結果

要注意的是 Integration Test 是不會跟外部互動的，因此如果登入表單要測 loading 或 response 回來的 case，需要用到 MSW 來攔截 request 並模擬 response

寫成 [Vitest](https://vitest.dev/)（測試 library）+ [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)（Render 與操作 React 元件） 大概會像這樣：

```js
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from './LoginForm';

describe('LoginForm 登入表單整合測試', () => {
  it('當使用者輸入錯誤的 Email 格式並按下登入，應該要顯示錯誤訊息', async () => {
    // 1. 準備模擬函式
    const mockLogin = vi.fn();

    // 2. 渲染元件
    render(<LoginForm onLogin={mockLogin} />);

    // 3. 模擬使用者互動（在 input 打字、點擊按鈕）
    const input = screen.getByTestId('email-input');
    const submitBtn = screen.getByRole('button', { name: '登入' });

    await userEvent.type(input, 'invalid-email'); // 故意輸入沒有 @ 的字串
    await userEvent.click(submitBtn);

    // 4. 斷言（檢查畫面上有沒有如預期出現錯誤，且登入函式沒有被觸發）
    const errorMsg = screen.getByTestId('error-msg');
    expect(errorMsg).toHaveTextContent('電子郵件格式錯誤');
    expect(mockLogin).not.toHaveBeenCalled();
  });
});
```

### e2e test

e2e 可以想成開啟瀏覽器，實際走過使用者會使用的流程，通常是用 [PlayWright](https://playwright.dev/) 或 [Cypress](https://www.cypress.io/#create) 這種工具來做。由於成本最高耗時最久，這步更要挑重要的流程來做

值得注意的是在這步會碰到很多外部的東西：

**後端與資料庫**

用測試用的機器或 docker，每次測試時都重置與清理狀態，確保不會汙染到 production 的資料

範例 testcase：

- 未登入使用者 -> 瀏覽商品列表 -> 點擊商品加入購物車 -> 進入結帳頁面 -> 填寫收件資訊 -> 送出訂單 -> 檢查畫面上是否出現「訂單成立」與訂單編號
- 在未登入的狀態下，直接用網址列強行輸入 `https://example.com/admin` -> 檢查前端 Router 有沒有成功攔截並強制導回登入頁

**第三方服務**

常見的有幾種：

- Auth（Google 登入、Apple 登入、Auth0、Firebase Auth）
- 金流（Stripe、2Checkout、Paypal、Apple Pay）
- 雲端儲存與 CDN
- 第三方通知與通訊（SendGrid、Twilio、Google Analytics）

針對第三方服務，e2e 不會真的瘋狂打他們，而是採用以下兩種策略：

1. 繞過或注入狀態：建立 Session 或 Cookie 填進瀏覽器以繞開登入流程
2. 使用官方提供的沙盒環境，例如 Stripe 跟 2Checkout 會提供測試用的信用卡號給開發者用

**Client-side Storage**

測試 localStorage、sessionStorage、Cookies、IndexedDB 資料是否有正確寫入，或使用了這些後功能有沒有正常。範例：

```js
import { test, expect } from '@playwright/test';

test('登入成功後，Token 應該要正確存入 localStorage', async ({ page }) => {
  await page.goto('/login');

  // 1. 模擬使用者填寫帳密並送出
  await page.fill('#email', 'test@example.com');
  await page.fill('#password', 'correct_password');
  await page.click('button[type="submit"]');

  // 2. 等待畫面跳轉到後台首頁
  await expect(page).toHaveURL('/dashboard');

  // ==========================================
  // 3. 檢查瀏覽器儲存空間（這就是所謂的驗證）
  // ==========================================
  // 使用 Playwright 的 evaluate 檢查 localStorage
  const token = await page.evaluate(() => localStorage.getItem('access_token'));

  // 斷言：Token 不能是空的，且必須存在
  expect(token).toBeTruthy();
  expect(typeof token).toBe('string');
});
```

**Network, CDN & Routing**

就是跟網路有關的測試，因為比較複雜，下面直接舉幾個例子：

- 直接輸入深層網址或重新整理，不應該出現 404
- 當網路斷線時，點擊送出應顯示斷線提示
- 首頁的所有關鍵 CSS 與 JS 靜態資源必須成功載入
- 前端呼叫後端 API 時不應發生 CORS 阻擋錯誤

**Browser APIs & Device Emulation**

測一些針對 [Web API](https://developer.mozilla.org/en-US/docs/Web/API) 或裝置特有的功能：

- 當使用者身在日本東京時，系統時間或幣別有沒有正確轉換
- 瀏覽器的「是否允許使用相機/麥克風」、「是否允許推播通知（Push Notification）」

## Lint

Lint 是能自動化的改 Coding Style 的工具，常用的例如 ESLint、Prettier。主要功能有：

- 抓出 [Code Smell](https://gelis-dotnet.blogspot.com/2023/02/code-smell-or-bad-smell.html)
- 統一團隊的 Coding Style (Naming convention、Indent 等)

ESLint 跟 Prettier 可以透過 npm 安裝，VS Code 也有在寫 code 時以顏色標註的 Extension 能用

## Type Check

利用 TypeScript 的靜態型別檢查，把 Runtime 會出現的錯誤提前在編譯與開發期就排除

## 將測試放入開發流程並自動化

### 在 commit 時做 lint

[Husky](https://typicode.github.io/husky/) 是一個能幫專案操作 [Git Hook](https://hackmd.io/@s716134/githook01) 的工具。透過他可以實現**在 commit 時自動跑 eslint, prettier** 的功能，確保每次 commit 都讓程式碼不至於長得太醜

### 用 GitHub Actions 跑測試

發生在開啟一個 PR 準備把 code merge 進別的 branch 時。[GitHub Actions](https://github.com/features/actions) 是 GitHub 上的 CI/CD 工具，可以用它來定義開 PR 的時候跑測試的流程，使專案測試都通過才 merge

需要做兩件事：

1. 在專案中設定 yaml 檔，定義觸發時機、要測試的工作
2. 在 GitHub 設定 Branch protection rules，使測試沒通過前不能 merge

每次觸發流程時，GitHub Actions 都會新開一個 VM，安裝需要的程式碼與套件。因為有 cache 的機制，不用擔心每次都重裝會很慢

```yaml
name: Frontend CI

# 設定觸發時機：當有人向 main 分支發起 Pull Request，或直接 push 到 main 時觸發
on:
  pull_request:
    branches: [ main ]
  push:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      # 1. 把專案程式碼拉進 VM
      - name: Checkout code
        uses: actions/checkout@v4

      # 2. 設定 Node.js 與 pnpm 環境
      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: latest

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      # 3. 安裝相依套件
      - name: Install dependencies
        run: pnpm install

      # 4. 執行 Lint、Type Check 與測試
      - name: Run Lint and TypeCheck
        run: |
          pnpm lint
          pnpm check

      - name: Run Tests
        run: pnpm test --run
```

## 讓 AI 寫出好的測試

當然有了 AI 幫忙，測試可以寫得更快與完整。為了避免 AI 寫出多餘，或會干擾開發、成為技術債的測試，應該要給 AI 一些能明確遵守的規範，例如：

- 明確指定測試層級、工具與邊界
- 給予專案既有的測試範例
- 給予 AI 測試成本的標準
- 請 AI 在新增測試前徵詢同意

規範範例：

```markdown
## Testing Guidelines

Co-locate Vitest/React Testing Library tests as `src/**/*.test.ts` or `*.test.tsx`; test public
contracts and accessible behavior (roles, names, keyboard interaction), not styling details. Put
Playwright specs in `tests/e2e/*.spec.ts`. Run `pnpm test` while iterating and `pnpm check` before
submission. Run `pnpm test:e2e` for routing, locale, responsive, or interaction changes. Visual
changes require desktop and mobile review and screenshots in the pull request. Install Chromium
once with `pnpm exec playwright install chromium`.
```

## 總結

好的測試可以讓程式變得可靠、維護變得容易。在考量到測試成本與程式可靠性的取捨時，有賴於對產品重點流程的理解，及團隊共同制訂與溝通出的測試方法與範圍。有了 AI 協作寫測試後，更應清楚定義測試的 spec，及規範 AI 的行為準則

## Reference

- [Web API](https://developer.mozilla.org/en-US/docs/Web/API)
- [Husky 教學](https://emtech.cc/p/husky/)
- [別再用 1+1=2 學測試了！這次就讓我們從 Vitest 開始學單元測試吧！](https://israynotarray.com/vitest/20230420/4055762937/)
