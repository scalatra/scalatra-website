---
title: "Scalatra 2.6.0 is out"
layout: news
author: Naoki Takezoe
twitter: takezoen
date: 2017-11-11
---

The Scalatra team is pleased to announce the release of version 2.6.0 of the framework. Noteworthy upgrades include new validation framework named [scalatra-forms](/guides/2.6/formats/forms.html).

<!--more-->

Here's the full list of changes:

### Overall

* Upgrade libraries and Jetty version
* Remove all deprecated classes and methods which had been marked before 2.5.x
* Adopt Twirl as the default template engine (g8 template has been updated to use Twirl in default)
* Drop grizzled-slf4j dependency and use slf4j directly in Scalatra
* Drop `ResponseStatus` because `HttpServletResponse.setStatus(Int, String)` is deprecated

### Modules

* Deprecate Swagger 1.x support and merge scalatra-swagger-ext with scalatra-swagger
* Deprecate scalatra-commands and introduce scalatra-forms instead
* Deprecate scalatra-spring
* Drop scalatra-fileupload because it has been already deprecated since 2.1.0
* Merge request logging utility in scalatra-slf4j with core

All deprecated features in 2.6.0 will be dropped in 2.7.0 or 3.0.0. We have a plan to move [http4s](https://github.com/http4s/http4s) in Scalatra 3.0.0. Deprecation of features intends reducing maintenance cost and make it easy to renew architecture of Scalatra in 3.0.0.

Thanks to all committers and contributors!
