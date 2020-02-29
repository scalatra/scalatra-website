---
title: "Scalatra 2.7.0 is out"
layout: news
author: Naoki Takezoe
twitter: takezoen
date: 2020-03-01
---

More than 2 years since we planned, the Scalatra team is now pleased to announce the release of version 2.7.0 of the framework which officially supports Scala 2.13!

<!--more-->

Here's the list of major changes for version 2.7.0:

### Overall

* Scala 2.13 support
* Update dependent libraries
* #748 Drop scalatra-spring and scalatra-commands and all deprecated code in Scalatra 2.6
* #950 Use xenial and openjdk on TravisCI

### Scalatra Core

* #812 Throw original IOException from HttpServeltRequest
* #839 Removed dependency on mime-util
* #865 UriDecoder: Don't create set everytime
* #879 Deprecated RicherString#isBlank
* #983 Excluded '#' and '&' from path separator
* Remove Map inheritance from some core classes

### Scalatra Twirl

* #767 Twirl specific view helpers for scalatra-forms

### Scalatra Scalate

* #766 Scalate specific view helpers for scalatra-forms

### Scalatra Forms

* #856 Update return type of the form validation from Any to generic type

### Scalatra Json

* #826 deprecate JsonValueReader
* #827 deterred the premature JSON parse 

### Scalatra Swagger

* #748 Merge scalatra-swagger-ext with scalatra-swagger
* #748 Drop Swagger 1.x support
* #814 retain order of paths in swagger 2.0
* #870 Drop joda-time dependency
* #897 Drop SwaggerAuth
* #945 Added extra fields to Swagger 2.0 parameters
* #974 Support basic auth for Swagger rendering
* #980 Add a default HTTP 200 response ONLY if there's no other 2xx responses

### Scalatra Cache

* #748 Merge scalatra-cache-guava into scalatra-cache

### Scalatra Test

* #837 Fix hard coded resource base path

Thanks to all committers and contributors!

* Alexis Côté
* AndersonChoi
* Andrei Harbunou
* Eugene Krotov
* Horia Constantin
* Jim Riordan
* Kazuhiro Sera
* Magnolia.K
* Martin Laporte
* Naoki Takezoe
* Nick Green
* Philippe Vinchon
* Shani Elharrar
* Taras Iagniuk
* Toshiya MORI
* YoshinoriN
* john-roj
* kenji yoshida
* magnolia
* megaminx
* seraphr
* shimamoto
* sivapalan
* wlingxiao
* xuwei-k
