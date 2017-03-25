---
title: Scalatra 2.1 released
author: Dave Hrycyszyn
twitter: futurechimp
date: 2012-08-12
aliases:
    - /2012/08/12/scalatra-2-1-released.html
---

The Scalatra team is pleased to announce the release of Scalatra 2.1.

<!--more-->

Here's a list of what's in the new release:

scalatra-scalate

  * Request-scoped templateAttributes map lets you set common render context variables prior to the layout call. GH-134
  * Respect HttpOnly option on CookieOptions. GH-136
  * Support deleting cookies with paths. GH-138

scalatra-test

  * Log requests and responses to debug.
  * Replaced HttpTester with embedded Jetty and a real http client
  * Allows sending Content-Type for file uploads
  * Allows sending Array[Byte] as file body
  * Allows sending request body as Array[Byte]
  * Allows to get response body as Array[Byte] with bodyBytes method
  * Support for testing multipart requests.
  * Fix serving static resources in tests

scalatra-jerkson

Like the lift-json module but uses jerkson instead of lift-json

scalatra-slf4j

  * Level colorizer for getting the level of the log entry in the console in a different color
  * Scalatra request logger for slf4j which uses CGI param names

scalatra-auth

  * Removed the dual cookie auth stores and replaced with a single more configurable one
  * Cookie store now takes cookieOptions as an implicit
  * Increase visibillity of the BasicAuthRequest
  * Now uses ScalatraBase instead of ServletBase
  * Only run unauthenticated hook if authenticating for all strategies

scalatra-core

  * MethodOverrideSupport now also takes headers into account when deciding on the overload.
  * Adds support for X-XSRF-Token header as described in the angular js docs.
  * Cookie serialization now converts Max-Age to Expires to appease IE
  * I18nSupport is not thread-safe. GH-200
  * Improved handling of encoded uris, so that encoded /?# characters are supported
  * Allow usage of the ActionResult instances with halt (thanks igstan)
  * Support X-Http-Method-Override header.
  * Support mounting handlers by class as well as instance.
  * Support ActionResult class hierarchy to bundle status, headers, and body into one case class.
  * Returning an Int sets the status, just like Sinatra.
  * CsrfTokenSupport recognizes the X-CSRF-Token header.
  * Cross build dropped from artifact ID. The same build runs for all Scala 2.9.x.
  * Dropped support for Scala 2.8.x.

scalatra-lift-json

  * Unified the JsonSupport and JsonRequestBody traits
  * Adds support for the JSON vulnerability mitigation described in the angular js docs.
  * ensure JValue return type for parsed body
  * Make json body available as soon as possible
  * Render valid XML for a JValue serialization.
  * XML deserialization to jvalue now skips the root element

scalatra-akka

  * After filters run now asynchronously on asynchronous requests. GH-148

scalatra-fileupload

  * Deprecated in favor of native servlet handling. (Jetty users: requires >= 8.1.3.)
  * Exceptions now handled through standard error handler.

scalatra-swagger

  * Support for route documentation with Swagger

Scalatra is a tiny, Sinatra-like web framework for Scala.
