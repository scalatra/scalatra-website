---
aliases:
  - /2.3/guides/deployment/cloudbees.html
title: Deploying to CloudBees
---

[CloudBees](http://www.cloudbees.com/) is a hosted platform for JVM apps that puts everything from source control to continuous integration to production deployment under one roof.

Its free plan is more than sufficient for a simple Scalatra app.

---

## 1. [Register](https://www.cloudbees.com/signup) for an account.

## 2. Install the CloudBees SDK.
If you're a Mac [Homebrew](http://mxcl.github.com/homebrew/) user, it's as easy as `brew install bees`.
If you're not, check the [CloudBees installation instructions](https://developer.cloudbees.com/bin/view/RUN/BeesSDK).

After installing, run the `bees` command to provoke a login:


```sh
$ bees
# CloudBees SDK version: 1.2.2
Installing plugin: org.cloudbees.sdk.plugins:ant-plugin:1.1

You have not created a CloudBees configuration profile, let's create one now...
Enter your CloudBees account email address: you@you.com
Enter your CloudBees account password:
```

## 3. Set up a project.

- Create a Scalatra project from the usual Scalatra giter8 template.
Check out the the [installation]({{site.baseurl}}getting-started/installation.html) and [first project]({{site.baseurl}}getting-started/first-project.html) guides if this isn't familiar.

```sh
$ g8 scalatra/scalatra-sbt
$ cd [app root]
$ chmod u+x sbt
```

- Now create the war file:

```sh
$ cd [app root]
$ ./sbt
> package-war
[info] Compiling 2 Scala sources to /Users/yuvi/Desktop/my-scalatra-web-app/target/scala-2.9.2/classes...
[info] Packaging /Users/yuvi/Desktop/my-scalatra-web-app/target/scala-2.9.2/my-scalatra-web-app_2.9.2-0.1.0-SNAPSHOT.war ...
[info] Done packaging.
[success] Total time: 4 s, completed Dec 19, 2012 8:55:03 PM
```

## 4. Create your app on CloudBees

- Log into your account, and click on the Apps tab.
The first time you do that you'll have to subscribe for that service.
- Click Add New Application. Choose an app name and choose the runtime JVM Web Application (WAR).

## 5. Deploy

There are many customizations you can choose when deploying your app, such as specifying
the
[version of Java](http://developer.cloudbees.com/bin/view/RUN/Java+Container)
or the particular
[servlet container](http://developer.cloudbees.com/bin/view/RUN/Java+Container)
to be used.
We won't go into it here, but you can learn more on your own.


```sh
$ cd [app root]
$ ./sbt
$ bees app:deploy ./target/scala-2.9.2/my-scalatra-web-app_2.9.2-0.1.0-SNAPSHOT.war -a USERNAME/APPNAME -t jboss71
Deploying application scalatra-documenter/scalatra-test (environment: ): ./target/scala-2.9.2/my-scalatra-web-app_2.9.2-0.1.0-SNAPSHOT.war
........................uploaded 25%
........................uploaded 50%
........................uploaded 75%
........................upload completed
deploying application to server(s)...
Application scalatra-documenter/scalatra-test deployed: http://scalatra-test.scalatra-documenter.cloudbees.net
```

## 6. Visit your website

The output from the deploy phase shows the URL to visit.
