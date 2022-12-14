# Package Version Check Action

[![CI Status](https://github.com/technote-space/package-version-check-action/workflows/CI/badge.svg)](https://github.com/technote-space/package-version-check-action/actions)
[![codecov](https://codecov.io/gh/technote-space/package-version-check-action/branch/master/graph/badge.svg)](https://codecov.io/gh/technote-space/package-version-check-action)
[![CodeFactor](https://www.codefactor.io/repository/github/technote-space/package-version-check-action/badge)](https://www.codefactor.io/repository/github/technote-space/package-version-check-action)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/technote-space/package-version-check-action/blob/master/LICENSE)

*Read this in other languages: [English](README.md), [日本語](README.ja.md).*

npmパッケージ公開前にパッケージのバージョンをチェックする`GitHub Actions`です。

## Table of Contents

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
<details>
<summary>Details</summary>

- [スクリーンショット](#%E3%82%B9%E3%82%AF%E3%83%AA%E3%83%BC%E3%83%B3%E3%82%B7%E3%83%A7%E3%83%83%E3%83%88)
- [使用方法](#%E4%BD%BF%E7%94%A8%E6%96%B9%E6%B3%95)
  - [プッシュ時に使用](#%E3%83%97%E3%83%83%E3%82%B7%E3%83%A5%E6%99%82%E3%81%AB%E4%BD%BF%E7%94%A8)
  - [リリースプロセスで使用](#%E3%83%AA%E3%83%AA%E3%83%BC%E3%82%B9%E3%83%97%E3%83%AD%E3%82%BB%E3%82%B9%E3%81%A7%E4%BD%BF%E7%94%A8)
- [オプション](#%E3%82%AA%E3%83%97%E3%82%B7%E3%83%A7%E3%83%B3)
  - [BRANCH_PREFIX](#branch_prefix)
  - [COMMIT_DISABLED](#commit_disabled)
  - [COMMIT_MESSAGE](#commit_message)
  - [PACKAGE_NAME](#package_name)
  - [PACKAGE_DIR](#package_dir)
  - [TEST_TAG_PREFIX](#test_tag_prefix)
  - [NEXT_VERSION](#next_version)
- [Action イベント詳細](#action-%E3%82%A4%E3%83%99%E3%83%B3%E3%83%88%E8%A9%B3%E7%B4%B0)
  - [対象イベント](#%E5%AF%BE%E8%B1%A1%E3%82%A4%E3%83%99%E3%83%B3%E3%83%88)
  - [Conditions](#conditions)
- [動機](#%E5%8B%95%E6%A9%9F)
- [補足](#%E8%A3%9C%E8%B6%B3)
  - [コミット](#%E3%82%B3%E3%83%9F%E3%83%83%E3%83%88)
  - [Tags](#tags)
- [このアクションを使用しているリポジトリの例](#%E3%81%93%E3%81%AE%E3%82%A2%E3%82%AF%E3%82%B7%E3%83%A7%E3%83%B3%E3%82%92%E4%BD%BF%E7%94%A8%E3%81%97%E3%81%A6%E3%81%84%E3%82%8B%E3%83%AA%E3%83%9D%E3%82%B8%E3%83%88%E3%83%AA%E3%81%AE%E4%BE%8B)
- [Author](#author)

</details>
<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## スクリーンショット
1. `GitHub Action` 実行中  

   ![Running](https://raw.githubusercontent.com/technote-space/package-version-check-action/images/screenshot-1.png)

1. package.json のバージョンを更新 (ブランチが保護されていない場合)
  
   ![Updated](https://raw.githubusercontent.com/technote-space/package-version-check-action/images/screenshot-2.png)

## 使用方法
### プッシュ時に使用
   例：`.github/workflows/check_version.yml`
   ```yaml
   on: push
   name: Check package version
   jobs:
     checkVersion:
       name: Check package version
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v2

         # Use this GitHub Action
         - name: Check package version
           uses: technote-space/package-version-check-action@v1
           with:
             BRANCH_PREFIX: release/
   ```

### リリースプロセスで使用
   例：`.github/workflows/release.yml`
   ```yaml
   on:
     push:
       tags:
         - 'v*'
   name: Publish Package
   jobs:
     release:
       name: Publish Package
       runs-on: ubuntu-latest
       steps:
         - name: Checkout
           uses: actions/checkout@v2

         # Use this GitHub Action
         - name: Check package version
           uses: technote-space/package-version-check-action@v1
           with:
             COMMIT_DISABLED: 1

         - name: Install Package dependencies
           run: yarn install
         - name: Build
           run: yarn build
         - name: Publish
           run: |
             npm config set //registry.npmjs.org/:_authToken=$NPM_AUTH_TOKEN
             npm publish
           env:
             NPM_AUTH_TOKEN: ${{ secrets.NPM_AUTH_TOKEN }}
   ```
[対象イベントの詳細](#action-%E3%82%A4%E3%83%99%E3%83%B3%E3%83%88%E8%A9%B3%E7%B4%B0)

## オプション
### BRANCH_PREFIX
ブランチプリフィックス  
default: `''`  
例：`release/`

### COMMIT_DISABLED
コミットが無効かどうか  
default: `''`

### COMMIT_MESSAGE
パッケージバージョン更新用コミットのメッセージ  
default: `'feat: update package version'`

### PACKAGE_NAME
パッケージファイル名  
default: `'package.json'`

### PACKAGE_DIR
パッケージファイルが置かれたディレクトリ  
default: `''`

### TEST_TAG_PREFIX
テスト用タグのプリフィックス  
default: `''`  
例：`'test/'`

### NEXT_VERSION
次のバージョンを指定  
default: `''`  
e.g. `'v1.2.3'`

## Action イベント詳細
### 対象イベント
| eventName: action | condition |
|:---:|:---:|
|push: *|[condition1](#condition1)|
|release: published|[condition1](#condition1)|
|pull_request, pull_request_target: opened, reopened, synchronize|[condition2](#condition2)|
|created: *|[condition3](#condition3)|

### Conditions
#### condition1
- tags
  - semantic versioning tag (例：`v1.2.3`)
- branches
  - `${BRANCH_PREFIX}${tag}`
    - tag: semantic versioning tag (例：`v1.2.3`)
    - 例：branch: `release/v1.2.3`
#### condition2
- branches
  - `${BRANCH_PREFIX}${tag}`
    - tag: semantic versioning tag (例：`v1.2.3`)
    - 例：branch: `release/v1.2.3`
#### condition3
- tags
  - semantic versioning tag (例：`v1.2.3`)

## 動機
package.jsonバージョンの更新を忘れると、npmパッケージの公開は失敗します。

![Failed](https://raw.githubusercontent.com/technote-space/package-version-check-action/images/screenshot-4.png)

タグのプッシュでアクションを起動していた場合、

1. プッシュしたタグを削除
1. package.json のバージョンを更新
1. コミットして再度タグを付与
1. プッシュ

を再度行う必要があり、非常に面倒です。

この `GitHub Action` は、タグ名に基づいてpackage.jsonのバージョンを自動的に更新します。  
したがって、package.json のバージョンについて心配する必要はありません。  

また、ブランチが保護されていない場合、このアクションは変更をコミットします。  
ブランチが保護されている場合、このアクションは package.json のバージョンを更新するだけです。

## 補足
### コミット
コミットは『タグ付きのデフォルトブランチ(通常はmaster)』または『`${BRANCH_PREFIX}`から始まるブランチ』へのプッシュ時のみ有効です。

GitHub Actions で提供される`GITHUB_TOKEN`は連続するイベントを作成する権限がありません。  
したがって、プッシュによってトリガーされるビルドアクションなどは実行されません。  

![GITHUB_TOKEN](https://raw.githubusercontent.com/technote-space/package-version-check-action/images/no_access_token.png)

これはブランチプロテクションを設定していると問題になる場合があります。  

もしアクションをトリガーしたい場合は代わりに`personal access token`を使用してください。  
1. public_repo または repo の権限で [Personal access token](https://docs.github.com/ja/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token) を生成  
(repo はプライベートリポジトリで必要です)  
1. [ACCESS_TOKENとして保存](https://docs.github.com/ja/actions/security-guides/encrypted-secrets)
1. `GITHUB_TOKEN`の代わりに`ACCESS_TOKEN`を使用するように設定  
   例：`.github/workflows/check_version.yml`
   ```yaml
   on: push
   name: Check package version
   jobs:
     checkVersion:
       name: Check package version
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v2

         # Use this GitHub Action
         - name: Check package version
           uses: technote-space/package-version-check-action@v1
           with:
             GITHUB_TOKEN: ${{ secrets.ACCESS_TOKEN }}
             BRANCH_PREFIX: release/
   ```

![ACCESS_TOKEN](https://raw.githubusercontent.com/technote-space/package-version-check-action/images/with_access_token.png)

### Tags
タグ名は [Semantic Versioning](https://semver.org/) に従っている必要があります。  

## このアクションを使用しているリポジトリの例
- [GitHub Action Helper](https://github.com/technote-space/github-action-helper)
  - [pr-updated.yml](https://github.com/technote-space/github-action-helper/blob/master/.github/workflows/pr-updated.yml)
  - [ci.yml](https://github.com/technote-space/github-action-helper/blob/master/.github/workflows/ci.yml)
- [GitHub Action Config Helper](https://github.com/technote-space/github-action-config-helper)
  - [pr-updated.yml](https://github.com/technote-space/github-action-config-helper/blob/master/.github/workflows/pr-updated.yml)
  - [ci.yml](https://github.com/technote-space/github-action-config-helper/blob/master/.github/workflows/ci.yml)
- [GitHub Action Test Helper](https://github.com/technote-space/github-action-test-helper)
  - [pr-updated.yml](https://github.com/technote-space/github-action-test-helper/blob/master/.github/workflows/pr-updated.yml)
  - [ci.yml](https://github.com/technote-space/github-action-test-helper/blob/master/.github/workflows/ci.yml)
- [Filter GitHub Action](https://github.com/technote-space/filter-github-action)
  - [pr-updated.yml](https://github.com/technote-space/filter-github-action/blob/master/.github/workflows/pr-updated.yml)
  - [ci.yml](https://github.com/technote-space/filter-github-action/blob/master/.github/workflows/ci.yml)
- [jQuery Marker Animation](https://github.com/technote-space/jquery.marker-animation)
  - [pr-updated.yml](https://github.com/technote-space/jquery.marker-animation/blob/master/.github/workflows/pr-updated.yml)
  - [ci.yml](https://github.com/technote-space/jquery.marker-animation/blob/master/.github/workflows/ci.yml)
- [Gutenberg Utils](https://github.com/technote-space/gutenberg-utils)
  - [pr-updated.yml](https://github.com/technote-space/gutenberg-utils/blob/master/.github/workflows/pr-updated.yml)
  - [ci.yml](https://github.com/technote-space/gutenberg-utils/blob/master/.github/workflows/ci.yml)
- [Register Grouped Format Type](https://github.com/technote-space/register-grouped-format-type)
  - [pr-updated.yml](https://github.com/technote-space/register-grouped-format-type/blob/master/.github/workflows/pr-updated.yml)
  - [ci.yml](https://github.com/technote-space/register-grouped-format-type/blob/master/.github/workflows/ci.yml)

## Author
[GitHub (Technote)](https://github.com/technote-space)  
[Blog](https://technote.space)
