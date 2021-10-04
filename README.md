# Hypercore-to-http-server

Hypercore-to-http-server is a cli tool to decentralized the static content served by a http server. Put all content in a [Hyperbee](https://github.com/hypercore-protocol/hyperbee), then you can share the public key of the core and another peer can use it to import the content and and start an http server that hosts the content.

## usage

### Export

Export will put all the content in a folder on a Hyperbee instance.

``` bash
hypercore-to-http-server export --input ./folder-export --storage ./.core-folder # Hyperbee public key: 023155d52618784e55e598f6619bfc5b35fb20846efd390f74c4de157c435fb9
```

### Import

Anyone else can replicate the content that we previously put in a Hyperbee, and see in a local server.

``` bash
hypercore-to-http-server import --key 023155d52618784e55e598f6619bfc5b35fb20846efd390f74c4de157c435fb9  --output ./output-folder --storage ./.core --port 8080
```

Now you can check http://localhost:8080 and see the content of the Hyperbee.
