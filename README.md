# Package Version Check Action

[![CI Status](https://github.com/technote-space/package-version-check-action/workflows/CI/badge.svg)](https://github.com/technote-space/package-version-check-action/actions)
[![codecov](https://codecov.io/gh/technote-space/package-version-check-action/branch/master/graph/badge.svg)](https://codecov.io/gh/technote-space/package-version-check-action)
[![CodeFactor](https://www.codefactor.io/repository/github/technote-space/package-version-check-action/badge)](https://www.codefactor.io/repository/github/technote-space/package-version-check-action)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/technote-space/package-version-check-action/blob/master/LICENSE)

*Read this in other languages: [English](README.md), [日本語](README.ja.md).*

This is a `GitHub Actions` to check package version before publish npm.

## Table of Contents

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
<details>
<summary>Details</summary>

- [Screenshots](#screenshots)
- [Usage](#usage)
  - [Use when push](#use-when-push)
  - [Use in the release process](#use-in-the-release-process)
- [Options](#options)
  - [BRANCH_PREFIX](#branch_prefix)
  - [COMMIT_DISABLED](#commit_disabled)
  - [COMMIT_MESSAGE](#commit_message)
  - [PACKAGE_NAME](#package_name)
  - [PACKAGE_DIR](#package_dir)
  - [TEST_TAG_PREFIX](#test_tag_prefix)
  - [NEXT_VERSION](#next_version)
- [Action event details](#action-event-details)
  - [Target events](#target-events)
  - [Conditions](#conditions)
- [Motivation](#motivation)
- [Addition](#addition)
  - [Commit](#commit)
  - [Tags](#tags)
- [Example repositories using this Action](#example-repositories-using-this-action)
- [Author](#author)

</details>
<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Screenshots
1. Running `GitHub Action`  

   ![Running](https://raw.githubusercontent.com/technote-space/package-version-check-action/images/screenshot-1.png)

1. Updated version of package.json and commit (if branch is not protected)  

   ![Updated](https://raw.githubusercontent.com/technote-space/package-version-check-action/images/screenshot-2.png)

## Usage
### Use when push
   e.g. `.github/workflows/check_version.yml`
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

### Use in the release process
   e.g. `.github/workflows/release.yml`
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
[More details of target event](#action-event-details)

## Options
### BRANCH_PREFIX
Branch name prefix.  
default: `''`  
e.g. `release/`

### COMMIT_DISABLED
Whether commit is disabled.  
default: `''`

### COMMIT_MESSAGE
Commit message of update package version commit.  
default: `'feat: update package version'`

### PACKAGE_NAME
Package file name.  
default: `'package.json'`

### PACKAGE_DIR
Package directory.  
default: `''`

### TEST_TAG_PREFIX
Prefix for test tag.  
default: `''`  
e.g. `'test/'`

### NEXT_VERSION
Specify next version.  
default: `''`  
e.g. `'v1.2.3'`

## Action event details
### Target events
| eventName: action | condition |
|:---:|:---:|
|push: *|[condition1](#condition1)|
|release: published|[condition1](#condition1)|
|pull_request, pull_request_target: opened, reopened, synchronize|[condition2](#condition2)|
|created: *|[condition3](#condition3)|

### Conditions
#### condition1
- tags
  - semantic versioning tag (e.g. `v1.2.3`)
- branches
  - `${BRANCH_PREFIX}${tag}`
    - tag: semantic versioning tag (e.g. `v1.2.3`)
    - e.g. branch: `release/v1.2.3`
#### condition2
- branches
  - `${BRANCH_PREFIX}${tag}`
    - tag: semantic versioning tag (e.g. `v1.2.3`)
    - e.g. branch: `release/v1.2.3`
#### condition3
- tags
  - semantic versioning tag (e.g. `v1.2.3`)

## Motivation
If you forget to update the package.json version, publishing the npm package will fail.  

![Failed](https://raw.githubusercontent.com/technote-space/package-version-check-action/images/screenshot-4.png)

If you are invoking an action by pushing a tag, you have to do following steps again.

1. Delete pushed tag
1. Update package.json version
1. Commit and tag again
1. Push

This is very troublesome.

This `GitHub Action` updates the version in package.json based on the tag name automatically.  
So you don't have to worry about the version in package.json.  

This action also commits the change if the branch is not protected.  
If the branch is protected, this action just update the version in package.json.  

![Not commit](https://raw.githubusercontent.com/technote-space/package-version-check-action/images/screenshot-3.png)

## Addition
### Commit
Commit is valid when pushing to `default branch with tag` or `branch starting with ${BRANCH_PREFIX}`.

The `GITHUB_TOKEN` that is provided as a part of `GitHub Actions` doesn't have authorization to create any successive events.  
So it won't spawn actions which triggered by push.  

![GITHUB_TOKEN](https://raw.githubusercontent.com/technote-space/package-version-check-action/images/no_access_token.png)

This can be a problem if you have branch protection configured.  

If you want to trigger actions, use a personal access token instead.  
1. Generate a [personal access token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token) with the public_repo or repo scope.  
(repo is required for private repositories).  
1. [Save as ACCESS_TOKEN](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
1. Add input to use `ACCESS_TOKEN` instead of `GITHUB_TOKEN`.  
   e.g. `.github/workflows/check_version.yml`
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
Tag name format must be [Semantic Versioning](https://semver.org/).  

## Example repositories using this Action
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
