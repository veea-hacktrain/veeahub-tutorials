# To develop

Clone this repo to your laptop and install the dependencies

```bash
$ git clone https://github.com/veea-hacktrain/veeahub-tutorials.git
$ cd veeahub-tutorials
$ cd sensors/tinkerforge/temperature/javascript/src/
$ npm install --production
```

You will need to be running brickd on your system in order to fully run the
code natively. Installation steps here - https://www.tinkerforge.com/en/doc/Software/Brickd.html#brickd

# To deploy

Now that we've cloned the repo and installed our node dependencies we need to
build the container

```
$ cd veeahub-tutorials
$ docker build --file=sensors/tinkerforge/temperature/javascript/Dockerfile.arm32v7 .
...
...
Successfully built f4bfe100d839
```

At the bottom of the build steps there will be an Image ID. You will need to
use this to save the image to a tar file and send it over to the device.

```
$ docker save f4bfe100d839 > tftemp-0-0-1.tar
$ scp tftemp-0-0-1.tar hacktrain@10.0.0.1:
```

Once the transfer has completed put the container into docker on the VeeaHub:

```
$ ssh hacktrain@10.0.0.1

# On the VeeaHub
@ docker load < tftemp-0-0-1.tar
```

After that has completed you can now run your container

```
# -it = Run interactively with a tty
# --privileged = Give access to devices
# -p8080:8080 = The host port 8088 should map to the container port 8088
@ docker run -it --privileged -p8088:8088 f4bfe100d839
```

If you want to run it in the background. This is good once your service is up
and runnning

```
# -d = Run in the background
# --privileged = Give access to devices
# -p8080:8080 = The host port 8088 should map to the container port 8088
@ docker run -d --privileged -p8088:8088 f4bfe100d839
```
