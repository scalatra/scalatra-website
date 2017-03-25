---
title: "Scalatra 2.2.2 and 2.3.0M1 released"
author: Dave Hrycyszyn
twitter: futurechimp
date: 2013-12-07
aliases:
    - /2013/12/07/scalatra-2-2-2-and-2-3-0M1released.html
---

The Scalatra team is pleased to announce two new releases.

<!--more-->

Scalatra 2.2.2 is a maintenance release which fixes a number of bugs in 2.2.1.
It is a drop-in replacement of 2.2.1, and we recommend that all users upgrade.

We are also releasing Scalatra 2.3.0 Milestone 1, on the way to a full release of the Scalatra 2.3.x. This will have mostly minor breaking changes, lots of additional fixes, and some new features (most notably to keep up with new features in asynchronous library support and Swagger development).

One big thing to start thinking about if you're not already: Scalatra 2.3.x will drop support for Scala 2.9.

Here's a detailed list of what's in each of the releases.

## Scalatra 2.2.2

### Core

* Fix mount/addServlet for paths not ending in /*
* HaltException and PassExceptions are no longer control throwables.
* Respect servlet wrappers in AsyncSupport. (Fixes GZipSupport with async result).
* Unroll nested futures and async results. #321
* Allow Accept-Encoding header to be a list.

### Atmosphere

* Fix atmosphere disconnect handling.

### Auth

* Remove false dependency on scalatra-commands.

### Commands

* Properly humanize camel cased names.
* Add a better validation error serializer.

### Jetty

* Fix uninitalized value error.

### Json

* Ensure JSONP callbacks are fully written to the output stream.
* Fix JValue result for files.

### Scalate

* Normalize Scalate template path #335
* Support for i18n support in a ScalatraFilter.

### Specs2

* Fix Specs2 base trait infrastructure

### Swagger

* Modify scalatra-swagger api docs generation to better support apiproperty annotation.
* Add ability to document API operations that support multiple content type responses.



## Scalatra 2.3.0M1

### Core

* Support for Scala 2.9.x dropped.
* Sever hard Akka dependency. Integration is through scala.concurrent.
* Change FutureSupport.timeout from a Timeout to a Duration.
* Add a timeout to AsyncResult.
* Run callbacks before render in renderResponseBody.
* Redirect returns Nothing, not unit.
* Allow calling halt from trap handler.
* Remove Akka dependency. Only scala.concurrent is needed.

### Atmosphere

* Make ScalatraBroadcaster a trait for custom broadcasters.
* Add RedisScalatraBroadcaster.
* Support ClientFilter with Redis Atmosphere plugin.

### Commands

* Ensure ordering of properties on body parameters from a command by adding a position method.

### I18n

* Provide a way to implement custom Messages resolver.

### JSON

* Support custom serializers in JValueResult.
* Check if response is JSON or XML in renderJson.

### Scalate

* Don't always render the Scalate Error page.

### Spring

* New support module for Spring.

### Swagger

* Add naive exclusion based on simple class name and known model ID.
* Add apiOperation and parameter methods that use a Swagger model declaration directly.
* Fix detection of default value.
* Fix Option data type on models.
* Fix NPE when the model property has a default value of null.
* BREAKING Use 1.2 spec.
* Fix URL generation when a context path is set.
* Fix serialization of data type for operations and parameters.
* Fix Option[List[_]] reflection.
* Output position in Swager spec so model properties have a stable order.
* Annotated properties are required by default.
* Force compilation error for apiOperation without type param.
