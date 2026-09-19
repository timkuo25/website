---
title: "フロントエンドのテストって実際どうやるの"
date: "2026-07-21"
excerpt: "Test Driven Developing (is dead?)"
sections: ["tech"]
---

## 何をテストすべきか

私と同じ疑問を持つ人もいるかもしれません。フロントエンドのテストって、実際どうやるんだろう？どんな状況でも UI が絶対に壊れないことを保証するってことなのか？だとしたら終わるわけがない、世の中にはこれだけ多くの端末や解像度があるのに、全部の状況をカバーできるはずがない。

シンプルな答えは「不可能」です。UI のすべてのピクセルを完璧に仕上げることをテストの目的にしている人もいません。とはいえ Playwright / Cypress のスクリーンショット機能でざっくり確認することはできます。では、フロントエンドのテストは結局何をテストすべきなのでしょうか？

この問いは、フロントエンドのテストが「何であって・何でないか」、そして「何をすべきで・何をすべきでないか」から理解していくのが良いと思います。

## 原則

### Is/Isn't/Do/Don't

**フロントエンドのテストは「〜である」**

- **メンテナンスとリファクタリングの土台**：テストの最大の価値は、エンジニアが大胆にリファクタリングやメンテナンスをできる自信を与えてくれること。あちこち直すたびに壊れるんじゃないかとビクビクしなくて済む
- **コンポーネントや関数の仕様書**：テストケースを通して、あるコンポーネントや関数が様々な入力に対してどんな出力・振る舞いをすべきかを定義する
- **ロジックと振る舞いの防衛線**：ビジネスロジック、状態遷移、API 呼び出し、データ処理が何度イテレーションを重ねても正しく動くことを保証する

**フロントエンドのテストは「〜ではない」**

- **バグゼロの万能薬**：テストが証明できるのは「テストした範囲は問題ない」ということだけで、想定外のエッジケースや全く新しいバグを完全に防ぐことはできない
- **見た目やレイアウトの検査官**：ユニットテストや統合テストには実際の画面が見えていないので、CSS のピクセル数やレイアウト崩れは関知しないし、そもそも全部はカバーしきれない

**フロントエンドのテストは「〜すべき」**

- **「振る舞いと状態」に集中する**：ユーザーが何をクリックしたか、何の状態が変わったか、正しいデータが出力されたか（例：ボタンをクリックしたらカウンターが 1 増えるか）をテストする
- **リスクが高い部分・コアなロジックを優先してカバーする**：ビジネスロジック、複雑なデータ処理関数、共通の Hook、そしてミスが起きやすいフォームやステートマシンにエネルギーを注ぐ
- **80/20 の法則を受け入れる**：最も重要で、最もよく壊れる経路（Happy Path とよくある Error Path）を狙ってテストを書き、投資対効果を最大化する

**フロントエンドのテストは「〜すべきでない」**

- **CSS の数値やスタイルの細部に縛られる**：「このコンポーネントの幅は 300px かどうか」「色がある hex 値かどうか」「このレイアウトが崩れていないか」といったことをテストしない
- **無意味なテストを書く**：ロジックのない静的な UI をテストしたり、数を稼ぐためだけの実質的なアサーションのないテストを書いたりしない

テストは書こうと思えばキリがないので、範囲を決める必要があります。では、それは誰が決めるべきなのでしょうか？

一番良いのはチームで話し合うこと、あるいは PM が出したビジネス要件をもとに、どのテスト・どの edge case が重要かを判断することです。

もし上司から「これテスト書いといて」とだけ言われて、何をテストすべきかは教えてもらえなかった場合（私自身、そういう経験があります。しかも JUnit の本まで渡されました。本を読む時間なんて誰にあるんだ、と思いました）、それはテストの範囲を自分で定義して、何が重要かを考えるチャンスでもあります。もちろん、上司が何も言わなかったということは、実はそんなに重要ではなくて、あなたが無駄な作業をしている可能性もあります。

以下のような方向性から始めると良いでしょう：

- Happy Path とよくある Error Path をきちんと書く
- commit、バグ、Jira、会議の記録を見て、どこが地雷になりやすいかを確認する
- 大まかな方針を上司に確認してもらう（仕事はコミュニケーションが大事！！）

## 3 本柱

### Unit Test

シンプルな関数、あるいは `utils/` ディレクトリにある関数をテストする対象で、ネットワーク・DOM・DB に触れないので実行が速い。例：文字列のフォーマッター、パスワードルールのチェック、シンプルな React Hook。

Unit Test は基本的にコンポーネント単位で行われることが多く、React のエコシステムではテストファイルをコンポーネントのすぐ隣に置く習慣があります：

```
src/
├── components/
│   └── Button/
│       ├── Button.tsx        # コンポーネント本体
│       ├── Button.styles.ts  # スタイル
│       └── Button.test.tsx   # 👈 すぐ隣に置かれたテストファイル
├── utils/
│   ├── formatPrice.js        # ユーティリティ関数
│   └── formatPrice.test.js   # 👈 そのテストファイル
```

「ボタンを disabled にしたらクリックできなくなる」といった DOM や UI コンポーネントの挙動に関するテストは、普通は自分で書く必要はありません。ブラウザ自身や、Radix、Material UI、Ant Design などのライブラリがすでにテスト済みだからです。ただし、その上に何かをラップしたり、ボタンを押したときに自分のアプリ独自のロジックが発火するような場合は、それは自分でテストを書く必要があります。

### Integration Test

フロントエンドの統合テストは、複数のコンポーネントを組み合わせて、大きなコンポーネントやページ全体がちゃんと動くかを確認します。ログインフォームを例にすると、次のことが必要です：

1. フォームと関連するすべてのコンポーネントを render する
2. データを入力して送信する（ユーザー操作）
3. 画面と挙動の結果を確認する

注意点として、Integration Test は外部と通信しません。そのため、ログインフォームで loading やレスポンスが返ってきた後の挙動をテストしたい場合は、MSW を使ってリクエストをインターセプトし、レスポンスをモックする必要があります。

[Vitest](https://vitest.dev/)（テストライブラリ）+ [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)（React コンポーネントの render と操作用）で書くと、大体こんな感じになります：

```js
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from './LoginForm';

describe('LoginForm の統合テスト', () => {
  it('ユーザーが不正な形式の Email を入力してログインを押すと、エラーメッセージが表示される', async () => {
    // 1. モック関数を用意する
    const mockLogin = vi.fn();

    // 2. コンポーネントを render する
    render(<LoginForm onLogin={mockLogin} />);

    // 3. ユーザー操作をシミュレートする（input に入力、ボタンをクリック）
    const input = screen.getByTestId('email-input');
    const submitBtn = screen.getByRole('button', { name: 'ログイン' });

    await userEvent.type(input, 'invalid-email'); // わざと @ のない文字列を入力
    await userEvent.click(submitBtn);

    // 4. アサーション（想定通りエラーが表示され、ログイン関数が呼ばれていないことを確認）
    const errorMsg = screen.getByTestId('error-msg');
    expect(errorMsg).toHaveTextContent('メールアドレスの形式が正しくありません');
    expect(mockLogin).not.toHaveBeenCalled();
  });
});
```

### e2e test

e2e は、実際にブラウザを開いてユーザーが辿るであろうフローをそのまま歩く、とイメージすると分かりやすいです。通常は [PlayWright](https://playwright.dev/) や [Cypress](https://www.cypress.io/#create) のようなツールを使います。コストが最も高く、時間もかかるので、このステップでは特に重要なフローを選ぶ必要があります。

このステップでは外部の要素にたくさん触れることになる点にも注意が必要です：

**バックエンドとデータベース**

テスト用のマシンや docker を使い、テストのたびに状態をリセット・クリーンアップして、本番データを汚さないようにします。テストケースの例：

- 未ログインユーザー -> 商品一覧を見る -> 商品をカートに追加 -> 決済画面へ進む -> 配送先情報を入力 -> 注文を送信 -> 画面上に「注文完了」と注文番号が表示されるか確認する
- 未ログインの状態で、アドレスバーから直接 `https://example.com/admin` を強引に入力する -> フロントエンドの Router がそれをちゃんとインターセプトして、ログインページへ強制的にリダイレクトするか確認する

**サードパーティサービス**

よくあるものはいくつかあります：

- 認証（Google ログイン、Apple ログイン、Auth0、Firebase Auth）
- 決済（Stripe、2Checkout、Paypal、Apple Pay）
- クラウドストレージと CDN
- サードパーティの通知・通信（SendGrid、Twilio、Google Analytics）

サードパーティサービスに対して、e2e は本当にガンガンリクエストを送りつけたりはせず、次の 2 つの戦略を取ります：

1. 状態を迂回・注入する：セッションや Cookie を作ってブラウザに仕込み、ログインフローを飛ばす
2. 公式が提供するサンドボックス環境を使う。例えば Stripe や 2Checkout は、開発者向けにテスト用のクレジットカード番号を提供している

**Client-side Storage**

localStorage、sessionStorage、Cookies、IndexedDB にデータが正しく書き込まれているか、それらを使った機能がちゃんと動くかをテストします。例：

```js
import { test, expect } from '@playwright/test';

test('ログイン成功後、Token が localStorage に正しく保存されること', async ({ page }) => {
  await page.goto('/login');

  // 1. ユーザーが ID・パスワードを入力して送信する様子をシミュレート
  await page.fill('#email', 'test@example.com');
  await page.fill('#password', 'correct_password');
  await page.click('button[type="submit"]');

  // 2. 画面がダッシュボードに遷移するのを待つ
  await expect(page).toHaveURL('/dashboard');

  // ==========================================
  // 3. ブラウザのストレージを確認する（これが本当の検証部分）
  // ==========================================
  // Playwright の evaluate で localStorage を確認する
  const token = await page.evaluate(() => localStorage.getItem('access_token'));

  // アサーション：Token は空であってはならず、存在していなければならない
  expect(token).toBeTruthy();
  expect(typeof token).toBe('string');
});
```

**Network, CDN & Routing**

ネットワーク関連のテストです。比較的複雑になるので、以下に直接いくつか例を挙げます：

- 深い階層の URL を直接入力したり、リロードしたりしても 404 が出てはいけない
- ネットワークが切断されているとき、送信ボタンを押すと切断中の通知が表示されるべき
- トップページの重要な CSS・JS の静的リソースはすべて正常に読み込まれなければならない
- フロントエンドがバックエンドの API を呼び出す際に CORS でブロックされてはいけない

**Browser APIs & Device Emulation**

[Web API](https://developer.mozilla.org/en-US/docs/Web/API) や端末固有の機能に関するテストです：

- ユーザーが日本の東京にいるとき、システム時刻や通貨が正しく変換されるか
- ブラウザの「カメラ・マイクの使用を許可するか」「プッシュ通知を許可するか」といったプロンプト

## Lint

Lint はコーディングスタイルを自動的に直してくれるツールで、よく使われるのは ESLint や Prettier です。主な機能は：

- [Code Smell](https://gelis-dotnet.blogspot.com/2023/02/code-smell-or-bad-smell.html) を検出する
- チームのコーディングスタイル（命名規則、インデントなど）を統一する

ESLint と Prettier は npm でインストールでき、VS Code にもコードを書きながら色付きで警告してくれる拡張機能があります。

## Type Check

TypeScript の静的型チェックを使って、実行時に出るはずのエラーをコンパイル・開発の段階で前もって排除します。

## テストを開発フローに組み込んで自動化する

### commit 時に lint を実行する

[Husky](https://typicode.github.io/husky/) は、プロジェクトが [Git Hook](https://hackmd.io/@s716134/githook01) を扱うのを助けてくれるツールです。これを使うと、**commit 時に自動で eslint や prettier を実行する**機能を実現でき、毎回の commit でコードが見苦しくなりすぎないようにできます。

### GitHub Actions でテストを実行する

これは PR を開いて、コードを別のブランチにマージしようとするときに発生します。[GitHub Actions](https://github.com/features/actions) は GitHub の CI/CD ツールで、PR を開いたときにテストを実行するフローを定義でき、プロジェクトのテストがすべて通ってから merge されるようにできます。

やるべきことは 2 つです：

1. プロジェクトに yaml ファイルを設定し、トリガーのタイミングとテストするジョブを定義する
2. GitHub 側で Branch protection rules を設定し、テストが通るまで merge できないようにする

フローがトリガーされるたびに、GitHub Actions は新しい VM を立ち上げ、必要なコードとパッケージをインストールします。キャッシュの仕組みがあるので、毎回フルインストールで遅くなる心配はありません。

```yaml
name: Frontend CI

# トリガーのタイミングを設定：main ブランチへの Pull Request、または main への直接 push で発火
on:
  pull_request:
    branches: [ main ]
  push:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      # 1. プロジェクトのコードを VM に取り込む
      - name: Checkout code
        uses: actions/checkout@v4

      # 2. Node.js と pnpm の環境を設定する
      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: latest

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      # 3. 依存パッケージをインストールする
      - name: Install dependencies
        run: pnpm install

      # 4. Lint、Type Check、テストを実行する
      - name: Run Lint and TypeCheck
        run: |
          pnpm lint
          pnpm check

      - name: Run Tests
        run: pnpm test --run
```

## AI に良いテストを書かせる

もちろん AI の助けを借りれば、テストはより速く、より網羅的に書けます。AI が余計なテストや、開発の邪魔になって技術的負債になるようなテストを書かないようにするには、明確に守るべきルールを与えるべきです。例えば：

- テストのレベル、使うツール、範囲を明確に指定する
- プロジェクトに既にあるテストの例を渡す
- テストを書くコストの基準を AI に与える
- 新しいテストを追加する前に AI に確認を求めさせる

ルールの例：

```markdown
## Testing Guidelines

Co-locate Vitest/React Testing Library tests as `src/**/*.test.ts` or `*.test.tsx`; test public
contracts and accessible behavior (roles, names, keyboard interaction), not styling details. Put
Playwright specs in `tests/e2e/*.spec.ts`. Run `pnpm test` while iterating and `pnpm check` before
submission. Run `pnpm test:e2e` for routing, locale, responsive, or interaction changes. Visual
changes require desktop and mobile review and screenshots in the pull request. Install Chromium
once with `pnpm exec playwright install chromium`.
```

## まとめ

良いテストは、コードを信頼できるものにし、メンテナンスをしやすくしてくれます。テストのコストとコードの信頼性のトレードオフを考えるには、プロダクトの重要なフローへの理解と、チームで一緒に決めて共有したテストの方法・範囲が欠かせません。AI とテストを一緒に書く時代になったからこそ、テストの仕様を明確に定義し、AI の振る舞いのルールを定めることがより一層重要になります。

## Reference

- [Web API](https://developer.mozilla.org/en-US/docs/Web/API)
- [Husky チュートリアル](https://emtech.cc/p/husky/)
- [1+1=2 でテストを学ぶのはもう卒業！Vitest で単体テストを学ぼう](https://israynotarray.com/vitest/20230420/4055762937/)
