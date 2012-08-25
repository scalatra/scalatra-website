---
layout: default
title: Introduction
---

Introduction
============

Scalatra is one of a new breed of simple, accessible, scalable web frameworks.
It combines the power of the JVM with the beauty and brevity of
[Scala](http://scala-lang.org), allowing you to build high-performance web APIs
which may be asynchronous or realtime.

### Getting started

You will need to install a few things before you can get started, but first,
here's a very simple Scalatra app:

{pygmentize:: scala}
package com.example.app
import org.scalatra._

class HelloWorldApp extends ScalatraFilter {
  get("/") {
    "Hello world!"
  }
}
{pygmentize}

Notice a few things about it:

* It's small.
* It uses a [Sinatra](http://sinatrarb.com/)-style DSL.
* It defines a single method, an HTTP GET to the path "/".
* It renders a response, in this case the text _Hello World!_.

This is the essence of Scalatra - small, easy to understand systems which
embrace HTTP's stateless nature. You can build anything you want with Scalatra,
but one of the things it's been most successful at is the construction of
RESTful APIs.

### Why would you want to use Scalatra?

* It's a perfect server-side counterpart to in-browser client development frameworks such as [backbone.js](http://backbonejs.org/) or [angular.js](http://angularjs.org).
* It helps you to quickly build high-performance, scalable HTTP APIs.
* It's been proven in production - [LinkedIn][linkedin], the [Guardian newspaper][guardian], games website [IGN][ign], and the [UK government][govuk] all rely on it.
* It will happily use all available cores of that new 16-core server. It also gives you easy access to Scala's new concurrency-management constructs: Akka Actors.
* It's a simple, fun, and practical way to learn [Scala](http://www.scala-lang.org).

[linkedin]: http://www.linkedin.com
[guardian]: http://www.guardian.co.uk
[ign]: http://www.ign.com
[govuk]: http://www.gov.uk


