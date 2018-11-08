# To develop

Clone this repo to your laptop and install the dependencies

```bash
$ git clone https://github.com/veea-hacktrain/veeahub-tutorials.git
$ cd veeahub-tutorials
$ cd sensors/gps/javascript/src/
$ npm install --production
```

# To deploy

Now that we've cloned the repo and installed our node dependencies we need to
build the container

```
$ cd veeahub-tutorials
$ docker build --file=sensors/gps/javascript/Dockerfile.arm32v7 .
...
...
Successfully built 4764c785bfff
```

At the bottom of the build steps there will be an Image ID. You will need to
use this to save the image to a tar file and send it over to the device.

```
$ docker save 4764c785bfff > gpsjs-0-0-1.tar
$ scp gpsjs-0-0-1.tar hacktrain@10.0.0.1:
```

Once the transfer has completed put the container into docker on the VeeaHub:

```
$ ssh hacktrain@10.0.0.1

# On the VeeaHub
@ docker load < gpsjs-0-0-1.tar
```

After that has completed you can now run your container

```
# -it = Run interactively with a tty
# -p8080:8080 = The host port 8088 should map to the container port 8088
@ docker run -it -p8088:8088 4764c785bfff
```

If you want to run it in the background. This is good once your service is up
and runnning

```
# -d = Run in the background
# -p8080:8080 = The host port 8088 should map to the container port 8088
@ docker run -d -p8088:8088 f4bfe100d839
```
