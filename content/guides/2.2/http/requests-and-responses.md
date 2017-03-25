---
aliases:
  - /2.2/guides/http/requests-and-responses.html
title: Requests and responses
---

## Request

Inside any action, the current request is available through the `request` variable.
The underlying servlet request is implicitly extended with the following methods:

<dl class="dl-horizontal">
  <dt>body</dt>
  <dd>to get the request body as a string.</dd>
  <dt>isAjax</dt>
  <dd>to detect AJAX requests.</dd>
  <dt>cookies</dt>
  <dd>a Map view of the request's cookies.</dd>
  <dt>multiCookies</dt>
  <dd>a Map view of the request's cookies.</dd>
</dl>

The `request` also implements a `scala.collection.mutable.Map` backed by the
request attributes.

<div class="alert alert-info">
  <span class="badge badge-info"><i class="icon-flag icon-white"></i></span>
  The
  <a href="{{site.examples}}http/scalatra-http-demo">scalatra-http-demo</a>
  is a good place to start if you need to see basic requests and response, cookies,
  and dealing with form input.
</div>

## Response

The response is available through the `response` variable.

<span class="badge badge-warning"><i class="icon-warning-sign icon-white"></i></span>
If you override the Scalatra handling and write directly to
the response object (e.g. `response.getOutputStream`), then your action should
return `Unit()` to prevent a conflict with multiple writes.

## ServletContext

The servlet context is available through the `servletContext` variable.  The
servlet context implicitly implements `scala.collection.mutable.Map` backed
by servlet context attributes.
