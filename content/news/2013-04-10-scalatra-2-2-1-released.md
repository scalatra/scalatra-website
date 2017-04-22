---
title: "Scalatra 2.2.1 released"
layout: news
author: Dave Hrycyszyn
twitter: futurechimp
date: 2013-04-10
aliases:
    - /2013/04/10/scalatra-2-2-1-released.html
---

Scalatra 2.2.1, a bug-fix and maintenance release, is now out. The following changes have been made:

<!--more-->


## Core

* An action result with an int body renders the int as body not status
* Make matched route params available for a broader scope
* AsyncResult now uses an abstract val to force eager creation of the future
* Fixes preflight request for CORS (no longer necessary to define an options route)
* Fix redirecting from within an AsyncResult
* Fallback to servlet context init parameters when looking up a key

## Atmosphere

* Upgrade to atmosphere 1.0.12
* Route params are now available inside the atmosphere route

## Commands

* All validation error messages are now configurable
* Type class based execution instead of the command handler
* Fix detecting isRequired

## Auth

* Make scentry use implicit request and response
* Fix a case where the user would be falsely returned as Some(null)

## Swagger

* Fixes nickname field swagger spec generation
* Skips rendering swagger api’s without api operations registered
* Fix command support for swagger with new dsl syntax
* Reflection now correctly detects scala value types
* Reflection knows about nested generic types

## Scalate

* Fixes scalate usage in AsyncResult
