# Handlersjs

![GitHub package.json version](https://img.shields.io/github/package-json/v/digita-ai/handlersjs)  	  ![Build Status](https://github.com/digita-ai/handlerjs/workflows/CI/badge.svg)

## What is Handlersjs

The goal of this project for us is to create an alternative for the big web frameworks like [Express](https://expressjs.com/) and [Koa](https://koajs.com/) to give ourselves more control over classes and how we use / instatiate them.
Handlersjs is a collection of classes and interfaces which are to be configured and or extended by the user.

## Packages inside this repo
 - [@digita-ai/handlersjs-core](https://github.com/digita-ai/handlersjs/tree/develop/packages/handlersjs-core)
 - [@digita-ai/handlersjs-http](https://github.com/digita-ai/handlersjs/tree/develop/packages/handlersjs-http)
 - [@digita-ai/handlersjs-logging](https://github.com/digita-ai/handlersjs/tree/develop/packages/handlersjs-logging)
 - [@digita-ai/handlersjs-storage](https://github.com/digita-ai/handlersjs/tree/develop/packages/handlersjs-storage)


## Lincense [MIT](https://github.com/digita-ai/handlersjs/blob/develop/LICENSE.md)
## How to use Handlersjs

#### In order to pull packages from GitHub, you need to [authenticate by using a personal access token](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry).

Add this line to your .npmrc file:
```
@digita-ai:registry=https://npm.pkg.github.com/
```

add the desired packages to your dependencies:
```
> npm i @digita-ai/handlersjs-core
```

### Barebones example configuration ( represented by [Components.js DI](https://componentsjs.readthedocs.io/en/latest/) configuration )

```
[
  {
    "@id": "urn:api-app:variables:apiHost",
    "@type": "Variable"
  },
  {
    "@id": "urn:api-app:variables:apiPort",
    "@type": "Variable"
  },
  {
	"@type": "NodeHttpServer",
	"port": { "@id": "urn:api-app:variables:apiPort" },
	"host": { "@id": "urn:api-app:variables:apiHost" },
	"nodeHttpStreamsHandler": {
	  "@type": "NodeHttpRequestResponseHandler",
	  "httpHandler": {
		"@type": "HttpCorsRequestHandler",
		"handler": {
		  "@type": "ErrorHandler",
		  "showUpstreamError": true,
		  "nestedHandler": {
			"@type": "RoutedHttpRequestHandler",
			"handlerControllerList": [
			  {
				"@type": "HttpHandlerController",
				"label": "IndexController",
				"routes": [
				  { "@id": "urn:api-app:default:routes:Index" }
				]
			  }
			]
		  }
		}
	  }
	}
  },
  {
	"@id": "urn:api-app:default:routes:Index",
	"@type": "HttpHandlerRoute",
	"operations": [
	  {
		"@type": "HttpHandlerOperation",
		"method": "GET"
	  }
	],
	"handler": {
	  "@type": "HttpHandlerStaticAssetService",
	  "path": "./assets/index.html",
	  "contentType": "text/html"
	},
	"path": "/index"
  }
]
```