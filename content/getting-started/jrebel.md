---
title: JRebel integration
---

[JRebel](http://zeroturnaround.com/software/jrebel/) is a JVM plugin that makes developing web apps much faster.
JRebel is generally able to eliminate the need for the following slow "app restart" in sbt following a code change:

```
> ~jetty:start
```

While JRebel is not open source, it does reload your code faster than stopping and restarting Jetty each time.

It's only used during development, and doesn't change your deployed app in any way.

JRebel used to be free for Scala developers, but that changed recently, and now there's a cost associated with usage for Scala. There are trial plans and free non-commercial licenses available if you just want to try it out.

----

## 1. Get a JRebel license

Sign up for a [usage plan](https://my.jrebel.com/). You will need to create an account.

## 2. Download JRebel

Download the most recent ["nosetup" JRebel zip](http://zeroturnaround.com/software/jrebel/download/prev-releases/).
Next, unzip the downloaded file.

## 3. Activate

Follow the [instructions on the JRebel website](http://zeroturnaround.com/software/jrebel/download/prev-releases/) to activate your downloaded JRebel.

You can use the default settings for all the configurations.

You don't need to integrate with your IDE, since we're using sbt to do the servlet deployment.

## 4. Tell Scalatra where JRebel is

Fortunately, the Scalatra giter8 project is already set up to use JRebel.
You only need to tell Scalatra where to find the jrebel jar.

To do so, edit your shell resource file (usually `~/.bash_profile` on Mac, and `~/.bashrc` on Linux), and add the following line:

```bash
export SCALATRA_JREBEL=/path/to/jrebel/jrebel.jar
```

For example, if you unzipped your JRebel download in your home directory, you whould use:

```bash
export SCALATRA_JREBEL=~/jrebel/jrebel.jar
```

Now reload your shell:

```
$ source ~/.bash_profile # on Mac
$ source ~/.bashrc       # on Linux
```

## 5. See it in action!

Now you're ready to use JRebel with the Scalatra giter8 plugin.
When you run sbt as normal, you will see a long message from JRebel, indicating it has loaded.
Here's an abbreviated version of what you will see:

```
$ ./sbt
Detected sbt version 0.12.1
Starting sbt: invoke with -help for other options
[2012-12-08 18:14:30]
[2012-12-08 18:14:30] #############################################################
[2012-12-08 18:14:30]
[2012-12-08 18:14:30]  JRebel 5.1.1 (201211271929)
[2012-12-08 18:14:30]  (c) Copyright ZeroTurnaround OU, Estonia, Tartu.
[2012-12-08 18:14:30]
[2012-12-08 18:14:30]  This product is licensed to John Doe
[2012-12-08 18:14:30]  for use with Scala classes only
[2012-12-08 18:14:30]
[2012-12-08 18:14:30]  License acquired through myJRebel server.
[2012-12-08 18:14:30]
[2012-12-08 18:14:30]  You are subscribed for the plan "JRebel Scala Plan",
[2012-12-08 18:14:30]  subscription ends on 2013-10-06,
[2012-12-08 18:14:30]  next license check with the server is required by 2013-01-07.
[2012-12-08 18:14:30]
[2012-12-08 18:14:30] #############################################################
[2012-12-08 18:14:30]
>
```

You will start the servlet container slightly differently now that you're using sbt.

```
> jetty:start
> ~ copy-resources
```

Don't worry if JRebel complains about there being no `test-classes` directory.
That directory will only exist when you're running tests.

Finally, change your code.
For example, if you're using the default giter8 project, you can change the web app's welcome message to this:

```scala
get("/") {
  <html>
    <body>
      <h1>Is JRebel working?</h1>
    </body>
  </html>
}
```

If JRebel is doing is correctly installed you will see a notice from JRebel that it has reloaded classes for you:

```
1. Waiting for source changes... (press enter to interrupt)
[2012-12-08 18:29:53] JRebel: Reloading class 'com.example.app.MyScalatraServlet'.
```

## 6. Limitations

JRebel is nearly always able to eliminate the need to explicitly reload your container after a code change. However, if you change any of your routes patterns, there is nothing JRebel can do, you will have to restart the Jetty with `jetty:start`.
