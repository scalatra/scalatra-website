---
title: "Scalatra 2.5.0 is out"
layout: news
author: Dave Hrycyszyn
twitter: futurechimp
date: 2016-11-21
---

The Scalatra team is pleased to announce the release of version 2.5.0 of the framework. Noteworthy upgrades include Scala 2.12 and Swagger 2 support.

<!--more-->

Updated documentation for 2.5.0 will be available shortly.

Here's the full list of changes:

## Scalatra Core

* #572 Fix error handling with Future and errorHandler by @ElPicador
* #573 Bump minor verions of various libs by @seratch
* #576 Copy from input stream in a loop to ensure full copy for files over 2GB by @pmcq
* #578 Escape javascript to avoid Xss by @megaminx
* #579 Add responseModel property to the response message by @takezoe
* #586 use runtimeClass. erasure is deprecated by @xuwei-k
* #587 remove unused dependency by @xuwei-k
* #590 remove unused joda-time dependency from core by @xuwei-k
* #597 fix #596 CorsSupport is broken by @jelmerk
* #598 Scala 2.12 support by @takezoe
* #599 drop java7, use java8 Base64 by @xuwei-k
* #604 Fix sbt 0.13.13 warnings, upgrade deps by @seratch
* #606 use sbt-unidoc by @xuwei-k

### Scalatra Commands

* #594 Specify Locale as ENGLISH for HttpDate pattern by @takezoe

### Scalatra Swagger

* #581 Add responseModel property to the response message by @takezoe
* #583 Swagger 2.0 support by @takezoe

### Scalatra Atmosphere

* #517 update atmosphere to version 2.4.3 by @GoranSchumacher, @chrisdoc
* #580 Expose a method in AtmosphereClient to close the websocket connection by @saephir
