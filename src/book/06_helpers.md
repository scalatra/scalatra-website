Helpers
=======

Scalate
-------

[Scalate](http://scalate.fusesource.org/) is a template engine for 
generating text and markup. It is the default rendering engine included
as a helper trait.

Once you have the `ScalateSupport` trait applied you can call 
`templateEngine.layout('index.page')` within your action handlers.

	    class MyScalatraFilter extends ScalatraFilter with ScalateSupport {
		  notFound {
		    // If no route matches, then try to render a Scaml template
		    val templateBase = requestPath match {
		      case s if s.endsWith("/") => s + "index"
		      case s => s
		    }
		    val templatePath = "/WEB-INF/scalate/templates/" + templateBase + ".scaml"
		    servletContext.getResource(templatePath) match {
		      case url: URL => 
		        contentType = "text/html"
		        templateEngine.layout(templatePath)
		      case _ => 
		        filterChain.doFilter(request, response)
		    } 
		  }
	    }

### Scalate error page

Mixing in ScalateSupport enables the Scalate error page for any uncaught
exceptions.  This page renders the template source with the error highlighted.
To disable this behavior, override `isScalateErrorPageEnabled`:

    override def isScalatePageEnabled = false

Scentry + Authentication
------------------------

Scentry is a user submitted authentication scheme. Combined 
`ScentrySupport` and `BasicAuthSupport` traits allow you to quickly tie a
User class to the session and Basic Authentication methods.

There is a new authentication middleware in the auth directory, to be documented soon.  See an example at [usage example](http://gist.github.com/660701).
Another [example](https://gist.github.com/732347) for basic authentication can be found

To use it from an SBT project, add the following to your project:

    val auth = "org.scalatra" %% "scalatra-auth" % scalatraVersion

### User Password

The User Password is the most common form/ajax/mixed strategy used in 
standard application development. 

TODO: Add example

### Remember Me

Remember Me is a common strategy that can be applied to your application.
It allows your users to return to your site already logged into their 
account by validating a secure token.


TODO: Add example

### Basic Authentication

Basic Authentication is the simplest authentication method. Due to the 
constraints of Basic Authentication it is recommended that people utilize
the User Password strategy if they need to have better control over user
interaction.

TODO: Add example




Flash Map
---------

Flash support is included within Scalatra by default. Flash entries are not
normally available within the current request scope. The exception is adding
new flash entries into `flash.now`.


TODO: Add better supporting examples

	flash += ("error" -> "An error occurred")
	flash.now += ("info" -> "redirect to see the error")


File Upload
-----------

Scalatra provides optional support for file uploads with <a href="http://commons.apache.org/fileupload/">Commons FileUpload</a>.

1. Depend on scalatra-fileupload.jar.  In your SBT build:

        val scalatraFileUpload = "org.scalatra" %% "scalatra-fileupload" % scalatraVersion

2. Extend your application with `FileUploadSupport`

        import org.scalatra.ScalatraServlet
        import org.scalatra.fileupload.FileUploadSupport

        class MyApp extends ScalatraServlet with FileUploadSupport {
          // ...
        }

3. Be sure that your form is of type `multipart/form-data`:
{pygmentize:: scala}
        get("/") {
          <form method="post" enctype="multipart/form-data">
            <input type="file" name="foo" />
            <input type="submit" />
          </form>
        }
{pygmentize}

4. Your files are available through the `fileParams` or `fileMultiParams` maps:
{pygmentize:: scala}
        post("/") {
          processFile(fileParams("file"))
        }
{pygmentize}

Anti-XML integration
--------------------

Scalatra provides optional [Anti-XML](http://anti-xml.org/) integration:

1. Depend on scalatra-anti-xml.jar.  In your SBT build:

        val scalatraAntiXml = "org.scalatra" %% "scalatra-anti-xml" % scalatraVersion

2. Extend your application with `AntiXmlSupport`

        import org.scalatra.ScalatraServlet
        import org.scalatra.antixml.AntiXmlSupport
        import com.codecommit.antixml._

        class MyApp extends ScalatraServlet with AntiXmlSupport {
          // ...
        }

3. Actions results of type `com.codecommit.antixml.Elem` will be serialized
to the response body, and a content type of `text/html` will be inferred if
none is set.

        get("/") {
          XML.fromString("""<foo bar="baz"></foo>""")
        }

WebSocket and Comet support through Socket.IO
---------------------------------------------

Scalatra provides optional support for websockets and comet through [socket.io](http://socket.io). We depend on [the socketio-java project](http://code.google.com/p/socketio-java) to provide this support.

1. Depend on the scalatra-socketio.jar. In your SBT build:
{pygmentize:: scala}
        val scalatraSocketIO = "org.scalatra" %% "scalatra-socketio" % scalatraVersion
{pygmentize}
2. SocketIO mimics a socket connection so it's easiest if you just create a socketio servlet at /socket.io/*

{pygmentize:: scala}
import org.scalatra.ScalatraServlet
import org.scalatra.socketio.SocketIOSupport

class MySocketIOServlet extends ScalatraServlet with SocketIOSupport {
  // ...
}
{pygmentize}

3. Setup the callbacks
{pygmentize:: scala}
        socketio { socket =>

          socket.onConnect { connection =>
            // Do stuff on connection
          }

          socket.onMessage { (connection, frameType, message) =>
            // Receive a message
            // use `connection.send("string")` to send a message
            // use `connection.broadcast("to send")` to send a message to all connected clients except the current one
            // use `connection.disconnect` to disconnect the client.
          }

          socket.onDisconnect { (connection, reason, message) =>
            // Do stuff on disconnection
          }
        }
{pygmentize}
4. Add the necessary entries to web.xml
{pygmentize:: xml}
        <servlet>
          <servlet-name>SocketIOServlet</servlet-name>
          <servlet-class>com.example.SocketIOServlet</servlet-class>
          <init-param>
            <param-name>flashPolicyServerHost</param-name>
            <param-value>localhost</param-value>
          </init-param>
          <init-param>
            <param-name>flashPolicyServerPort</param-name>
            <param-value>843</param-value>
          </init-param>
          <init-param>
            <param-name>flashPolicyDomain</param-name>
            <param-value>localhost</param-value>
          </init-param>
          <init-param>
            <param-name>flashPolicyPorts</param-name>
            <param-value>8080</param-value>
          </init-param>
        </servlet>  
{pygmentize}
              
When you want to use websockets with jetty the sbt build tool gets in the way and that makes it look like the websocket stuff isn't working. If you deploy the war to a jetty distribution everything should work as expected.
