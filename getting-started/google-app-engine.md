---
layout: default
title: Deploying to Google App Engine | Scalatra
---

<div class="page-header">
  <h1>Deploying to Google App Engine</h1>
</div>

Download Google App Engine [SDK for Java](https://developers.google.com/appengine/downloads#Google_App_Engine_SDK_for_Java).

Make the app engine install path available to sbt:

```bash
export APPENGINE_SDK_HOME="/PATH/TO/appengine-java-sdk-X.X.X"
```

Add the App Engine plugin for sbt to `project/plugins.sbt`:

```scala
addSbtPlugin("com.eed3si9n" % "sbt-appengine" % "0.4.1")
```

Create `src/main/webapp/WEB-INF/appengine-web.xml`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<appengine-web-app
    xmlns="http://appengine.google.com/ns/1.0"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://kenai.com/projects/nbappengine/downloads/download/schema/appengine-web.xsd appengine-web.xsd">
  <application>scalatra-test</application>
  <threadsafe>true</threadsafe>
  <version>1</version>
</appengine-web-app>
```

Delete from `build.sbt`:

```scala
TODO
```

Add to `build.sbt`:

```scala
appengineSettings
```


**If you use Google's 2-factor authentication, you must use a site-specific password for App Engine!**

```
> appengine-deploy
Reading application configuration data...
Dec 17, 2012 9:06:17 AM com.google.apphosting.utils.config.AppEngineWebXmlReader readAppEngineWebXml
INFO: Successfully processed /Users/yuvi/Desktop/my-scalatra-web-app/target/webapp/WEB-INF/appengine-web.xml
Dec 17, 2012 9:06:17 AM com.google.apphosting.utils.config.AbstractConfigXmlReader readConfigXml
INFO: Successfully processed /Users/yuvi/Desktop/my-scalatra-web-app/target/webapp/WEB-INF/web.xml
Beginning server interaction for scalatra-test...
Email: you@you.com
Password for you@you.com: letmein!
0% Created staging directory at: '/var/folders/t_/_7mpjl9d58996n0p51hn34rw0000gn/T/appcfg5334201739186787148.tmp'
5% Scanning for jsp files.
20% Scanning files on local disk.
25% Initiating update.
28% Cloning 36 application files.
40% Uploading 15 files.
52% Uploaded 3 files.
61% Uploaded 6 files.
68% Uploaded 9 files.
73% Uploaded 12 files.
77% Uploaded 15 files.
80% Initializing precompilation...
82% Precompiling... 1 file(s) left.
84% Sending batch containing 14 file(s) totaling 68KB.
90% Deploying new version.
95% Will check again in 1 seconds.
98% Will check again in 2 seconds.
99% Will check again in 4 seconds.
99% Will check again in 8 seconds.
99% Closing update: new version is ready to start serving.
99% Uploading index definitions.

Update completed successfully.
Success.
Cleaning up temporary files...
[info] 
[success] Total time: 60 s, completed Dec 17, 2012 9:07:14 AM
```

Open browser to [http://scalatra-test.appspot.com/](http://scalatra-test.appspot.com/).
