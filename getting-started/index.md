---
layout: home
title: Scalatra | Getting started
---

<div class="page-header">
  <h1>Getting started</h1>
</div>


You will need to install a few things before you can get started, but first,
here's a Scalatra app:

<div class="row">
  <div class="span6">
  {% highlight scala %}

    package com.example.app
    import org.scalatra._

    class HelloWorldApp extends ScalatraFilter {
      get("/") {
        "Hello world!"
      }
    }
  {% endhighlight %}
  </div>
  <div class="span6">
  <p>Notice a few things about it:</p>
  <ul>
    <li>It's small - a full web application in 7 lines of code.</li>
    <li>It uses a <a href="http://sinatrarb.com/">Sinatra</a>-style DSL.</li>
    <li>It defines a single method, an HTTP GET to the path "/".</li>
    <li>It renders a response, in this case the text <em>Hello world!</em></li>
  </div>
</div>

This is the essence of Scalatra - small, easy to understand systems which
embrace HTTP's stateless nature. You can build anything you want with Scalatra,
but one of the things it's been most successful at is the construction of
RESTful APIs.

 * [Installation](installation.html)
 * [First Steps](first-steps.html)
 * [Understanding A Scalatra Project](understanding-scalatra.html)