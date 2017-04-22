---
title: "Scalatra 2.4.0 will be out soon"
layout: news
author: Kazuhiro Sera
twitter: seratch
date: 2015-10-07
aliases:
    - /2015/10/07/scalatra-2-4-comming-soon.html
---

The Scalatra team is pleased to announce the release of Scalatra 2.4.0.RC3.

<!--more-->

2.4.0 release has many improvements and bugfixes as listed below.

If this version looks fine, we'd like to release 2.4.0 soon. Please try it out within days!

## Scalatra Core

* Removes the DefaultValue type class
* #434 Added support for generic content-encoding / decoding by @nrinaudo
* #436 Renamed GZipSupport to ContentEncodingSupport by @nrinaudo
* #438 Fix MIME type for .ogv (Ogg Video) by @abhalla-atl
* #452 Optimize imports by using IntelliJ IDEA by @seratch
* #453 Some code cleanup on core project by @seratch
* #456 Add explicit return types to core APIs, other improvements by @seratch
* #460 ScalatraServlet as a trait instead of an abstract class by @seratch
* #471 Fix #470 Add an implicit request to the cookies method by @seratch
* #474 Fix duplicated multiParams when multipart/form-data requests by @seratch
* #477 Bump Scala minor version (2.11.6, 2.10.5)  by @seratch
* #481 Bump minor version of dependencies by @seratch
* #483 Fix an XXE Vulnerability related to scala.xml.XML library by @seratch
* #500 Improve automatic charset detection performance by @takezoe
* #502 Bump minor version of dependencies by @seratch
* #514 Improve request/response stability wthin AsyncResult by @lloydmeta
* #528 Fix #435 Error with FutureSupport and ScalateI18nSupport using templating by @dozed
* #516 Introduce stable request response macro by @dozed
* #544 Removed request/response scoping macro from 2.4.x release by @dozed
* #535 [2.4.x] Fix #531 Params and multiParams are empty for PATCH request by @seratch
* #545 Bump dependencies and scala minor version by @seratch

### Scalatra Cache

* #455 Scalatra cache by @japhar81
* #541 Fixes double evaluation of result by @offner

## Scalatra Commands

* (Breaking change) Removes the default value for types, instead a field is now started in an invalid state by @casualjim
* (Breaking change) field.optional now is an alias for field.withDefaultValue(theDefault) by @casualjim
* #447 Minor upgrades and deprecation warnings reduction by @seratch
* #510 Fix deprecated APIs in Scalaz's ValidationOps by @xuwei-k

### Scalatra Json

* #432 Introduce a JsonResult type by @dozed
* #440 Take Formats bigDecimal setting into account when parsing. by @dozed
* #490 Bump json4s version to 3.3.0.RC1 by @seratch
* #504 Fix #496 Rendering JNull in a servlet by @seratch
* #512 Fix jackson json initialization issue (NPE) by @dozed

### Scalatra Scalate

* #444 Aligned template directory to new default (integrates with template-comp iler and g8 template). by @dozed
* #449 Fix Scalatra Test so client can send multiple headers of the same name by @shintasmith
* #476 Bump Scalate version to avoid NPEs by @lloydmeta

### Scalatra Metrics

* #441 Added basic metrics support by @japhar81
* #442 Added metrics support for response code filter by @japhar81
* #505 Upgrade to metrics-scala-3.5.1 by @rossabaker

### Scalatra ScalaTest

* #458 Made the traits extend the new -Like scalatest traits. by @DrDub

### Scalatra Atmosphere

* #492 Bump atmosphere-runtime to 2.2 by @adamretter

### Scalatra Swagger

* #490 Switch scalap to json4s-scalap since json4s 3.3.0 by @seratch

### Scalatra Specs2

* #508 Updated specs2 to 3.6.+ by @etorreborre
