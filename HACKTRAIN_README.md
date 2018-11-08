# Requirements

To use a VeeaHub you need:

1. To connect to a specific WiFi network
2. To be able to open an SSH connection

# Extra Docs and Tutorials

There are plenty of tutorials available at:

- https://github.com/veea-hacktrain
- http://docs.virtuosys.com (you'll need to enter you email address, but you'll be automatically accepted)

# Keywords

- Mesh: Local network of VeeaHubs connected to each other (for this event the mesh is over Wi-Fi).
- MEN: VeeaHub directly connected to the Internet via Ethernet, Wi-Fi (or cellular)
- MN: VeeaHub indirectly connected to the Internet via other VeeaHubs

# Development Flow

3 options

1. Develop locally (good if you don't need to install any extra packages into the container)
    1.1. Create your software on your laptop
    1.2. Create and build a Dockerfile
    1.3. Push the container to the VeeaHub
    1.4. Deploy the container over the Mesh
2. Develop locally, but build on the VeeaHub (good if you need to build ARM specific dependencies)
    2.1. Create your software on your laptop
    2.2. Create and build a Dockerfile
    2.3. Copy everything over to the Master VeeaHub (MEN) using SSH
    2.4. Build the container
    2.5. Push the container to the VeeaHub
    2.6. Deploy the container over the Mesh
3. Develop on the VeeaHub
    3.1. SSH into the VeeaHub
    3.2. Do you editing here
    3.3. Build the container
    3.4. Push the container to the VeeaHub
    3.5. Deploy the container over the Mesh
# Connecting to the VeeaHub

A Mesh consists of a Mesh Edge Node (MEN) and a Mesh Node (MN).
We have configured these devices so that you have SSH access.

To connect to your MEN:

1. Find the serial number of the Node (on the underside of the unit)
2. Connect to the Wireless Network called `ies05-{last 3 digits of serialnumber}-ap` with the password
    of `hacktrain`
3. SSH into the MEN at `hacktrain@10.0.0.1` with the password `hacktrain`

for example:

1. My serial number is 135050000298
2. I connect to `ies0500298` using password `hacktrain`
3. I SSH to `hacktrain@10.0.0.1` with the password `hacktrain`
4. I have access to the shell:

```
HypriotOS/armv7: hacktrain@ies0500298 in ~
$
```
# Building a custom docker image

The VeeaHubs run using a 32bit ARM CPU. This means that the Dockerfiles must begin
with an ARM32 base container. For example `arm32v6/debian` or `arm32v6/alpine`

## Building a simple web server

Let's say you wanted a simple webserver like nginx to serve some files for you.

The Dockerfile would look like:


```Dockerfile
# ~/nginxcontainer/Dockerfile
FROM arm32v6/alpine:3.8

RUN apk add -U nginx
RUN mkdir -p /run/nginx

CMD ["/usr/sbin/nginx", "-g", "daemon off;"]
```

Then to build the image on the VeeaHub:

```bash
cd ~/nginxcontainer
docker build .
```
# Pushing to Docker

We have put these nodes in Development mode for you. It gives you a bit more
flexibility to deploy applications easier. One restriction that we can't remove
is the security on your machine.

By default docker will not push to an insecure repository running over HTTP. If
you want to deploy to the Registry running on each of the nodes then you will
need to accept our secure certificate which is:

```
-----BEGIN CERTIFICATE-----
MIICKzCCAdCgAwIBAgIUBRrZl3IiIERs9UVpnRhR75ke8fswCgYIKoZIzj0EAwIw
czELMAkGA1UEBhMCR0IxETAPBgNVBAgTCFNvbWVyc2V0MQ0wCwYDVQQHEwRCYXRo
MRcwFQYDVQQKEw5WaXJ0dW9zeXMgTHRkLjENMAsGA1UECxMEVGVjaDEaMBgGA1UE
AxMRVmlydHVvc3lzIFJvb3QgQ0EwHhcNMTcwMjI4MTcxOTAwWhcNMjIwMjI3MTcx
OTAwWjBzMQswCQYDVQQGEwJHQjERMA8GA1UECBMIU29tZXJzZXQxDTALBgNVBAcT
BEJhdGgxFzAVBgNVBAoTDlZpcnR1b3N5cyBMdGQuMQ0wCwYDVQQLEwRUZWNoMRow
GAYDVQQDExFWaXJ0dW9zeXMgUm9vdCBDQTBZMBMGByqGSM49AgEGCCqGSM49AwEH
A0IABGl2yIJhWbph6cgwung+uk27kKZPOFetq2wTY24K6XqwmlYjPS1qWhRwks6/
RV029J3oL0YXduodMNs4+tfbWHqjQjBAMA4GA1UdDwEB/wQEAwIBBjAPBgNVHRMB
Af8EBTADAQH/MB0GA1UdDgQWBBQEtN1IqlbmHo9yUS6OW+m8VfK1iDAKBggqhkjO
PQQDAgNJADBGAiEA5T/xjduU/ns6b5qJ0/+P5ymx9kz193Qyt2nLbq6KiAwCIQD5
+DwuQePHVEl6THbvpsEjd/Kd/QPcfUEvPH3I0AQqqw==
-----END CERTIFICATE-----
```

## On Linux

Put the above certificate in /usr/local/share/ca-certificates/virtuosys-ca.crt
chmod 644 /usr/local/share/ca-certificates/virtuosys-ca.crt
sudo update-ca-certificates
sudo systemctl restart docker

## On Windows

1. Save the certificate in a virtuosys-ca.crt
2. Follow these steps here: https://support.globalsign.com/customer/portal/articles/1217281-import-and-export-certificate---microsoft-windows
3. Restart docker

## On OS X

1. Save the certificate in a virtuosys-ca.crt
2. Open up Keychain Access. You can get to it from Application/Utilities/Keychain Access.app.
3. Drag your certificate into Keychain Access.
4. Go into the Certificates section and locate the certificate you just added
5. Double click on it, enter the trust section and under “When using this certificate” select “Always Trust”

# Pushing

Now that your docker is configured to accept our secure certificate you can now
build and push your container to the MEN

```bash
docker build --tag=10.0.0.1/harry/myapp:0.0.1 .
docker push 10.0.0.1/harry/myapp:0.0.1
```
# Deploying to a VeeaHub

Docker is installed on the Edge nodes. It has an active Swarm, this will allow
you to deploy containers around the mesh. You only have 2 nodes, but imagine
you have 2 on every carriage on the train.

If SSH in, then you can list a sample application we have created in the
`examples` folder

# Deploying a container to one Node

See `docker` for documentation: https://docs.docker.com/

You can just use `docker` to do this:

```bash
docker run -it quay.io/myorganization/myimage:0.0.1
```

or to expose a HTTP service listening on port 8080 in the container and then
on the node

```bash
docker run -it -p 8080:8080 quay.io/myorganization/myimage:0.0.1
```

or to run this in the background

```bash
docker run -d -p 8080:8080 quay.io/myorganization/myimage:0.0.1
```

# Deploying a container to all nodes

If you've got temperature sensors running on all nodes you'll want to ensure
they're all running without deploying to every node individually

```bash
docker service create \
    --mode global \
    --mount type=bind,source=/dev/ttyAMA0,destination=/dev/ttyAMA0 \
    --env API_SERVER=https://api.mycloudservice.com \
    quay.io/myorganization/myimage:0.0.1
```

# Deploying a container to all nodes and publishing the port

Imagine you are running nginx to serve up some files, it can run on all nodes in
the mesh. You can then be automatically routed to the closed one using a special
address of `169.254.169.250`.

```bash
docker service create \
    --mode global \
    --publish 8080:80 \
    nginx
```

Now using a special address `169.254.169.250` you can connect to the published
service on port `8080`, the port you exposed.

```bash
$ curl 169.254.169.250:8080
<!DOCTYPE html>
<html>
<head>
<title>Welcome to nginx!</title>
<style>
....
```
# Finding other nodes on the Mesh

Each VeeaHub has a service running locally which will tell you where the unit
is located (if you have GPS) and who it's neighbours are. This allows you to
communicate to other nodes on the network.

The following example shows that this node (135050000157) has an IP address of
10.70.224.1, and there is one other node on the mesh 10.70.227.7. This node is
located at 51.379253,-2.358015 (in Bath).

```bash
$ curl -s http://169.254.169.250:5666/latest
```

```json
{
  "dynamic": {
    "location": {
      "latitude": 51.37925,
      "longitude": -2.3580167,
      "altitudeM": 38.6
    },
    "temperature": {
      "board": 59.072
    },
    "network": {
      "neighbours": [
        {
          "instance-id": "135050000298",
          "isThisNode": false,
          "hostname": "ies0500298",
          "ipv4": "10.70.227.7"
        },
        {
          "instance-id": "135050000157",
          "isThisNode": true,
          "hostname": "ies0500157",
          "ipv4": "10.70.224.1"
        }
      ],
      "routes": null,
      "installedRoute": null
    },
    "backhaul": {
      "interface": ""
    }
  },
  "meta-data": {
    "instance-id": "135050000157"
  }
}
```
# Tutorial Index

## hello-world-tutorial-r20:
Hello World C tutorial for Release 2.0.  Build a container in C. Push to the MAS and deploy as a serivce to the VeeaHub


## hello-world-java-tutorial-r20:
Hello World Java tutorial for Release 2.0.  Build a container in C. Push to the MAS and deploy as a serivce to the VeeaHub


## media-manager-and-browser-demo-tutorial:
Media Manager and Beacon broswer demo

## object-storage-demo-tutorial
Object Storage demonstration using minio server


## signage-demo-tutorial
LCD display demonstration

```bash
$ docker images |grep signage
  registry.internal.vsys.io:5000/demo/signage                  <none>              bc3555b7713e        20 months ago       155 MB
$ docker run --name=signagec --privileged --detach --env LINE1='Hello form a container' <IMAGE ID>
$ docker ps |grep signage
  3b2d27e5893d        bc3555b7713e  "/usr/bin/entry.sh..."   About a minute ago   Up About a minute   4223/tcp                   rabsignage
$ docker rm -f signagec
```

## webcam-demo-tutorial
USB/IP Webcam  demonstration

```
$ docker images |grep webcam
  registry.internal.vsys.io:5000/training/webcam               <none>              794618fb81fb        17 months ago       174 MB
$ docker run --name=webcamc --detach --privileged --env='CAMERA_WIDTH=480' --env='CAMERA_HEIGHT=320' --	env='STREAM_MAXRATE=10' --env='MOTION_THRESHOLD=1500' --env='ENABLE_IP_CAMERA=0' -p7981:8081 794618fb81fb
$ docker ps |grep webcamc
  ca0443182b9b        5878c907e9ad     "/usr/bin/entry.sh..."   5 seconds ago       Up 3 seconds        0.0.0.0:7981->7981/tcp     webcamc

docker rm -f webcamc
```

## audio-streaming-tutorial
Audio streaming demonstration using Wi-Fi speaker and mDNS

## iot-sensor-demo-tutorial
IoT sensor demonstration using Texas Instruments Bluetooth temperature sensor

```bash
$ docker images |grep sensor
  registry.internal.vsys.io:5000/demo/sensortag                <none>              641ccb87dfad        18 months ago       553 MB
$ docker run --name=sensorc --privileged --detach --env='DEVICE_MAC=54:6C:0E:79:2B:05' --env='WATSON_ID=002' --net=host <IMAGE ID>
$ docker ps |grep sensor
  a7465c12b8ce        641ccb87dfad     "/usr/bin/entry.sh..."   16 seconds ago      Up 14 seconds                                  sensorc
$ docker rm -f sensorc
```


# Peripherals

## Tinkerforge peripherals

- 3 x Master brick - https://www.tinkerforge.com/en/doc/Hardware/Bricks/Master_Brick.html
- 1 x Accelerometer - https://www.tinkerforge.com/en/doc/Hardware/Bricklets/Accelerometer.html
- 1 x LED Strip - https://www.tinkerforge.com/en/doc/Hardware/Bricklets/LED_Strip_V2.html
- 1 x RGB LED Button - https://www.tinkerforge.com/en/doc/Hardware/Bricklets/RGB_LED_Button.html
- 1 x LCD 20x4 - https://www.tinkerforge.com/en/doc/Hardware/Bricklets/LCD_20x4.html
- 1 x CAN 2.0 - https://www.tinkerforge.com/en/doc/Hardware/Bricklets/CAN_V2.html
- 1 x CO2 - https://www.tinkerforge.com/en/doc/Hardware/Bricklets/CO2.html
- 1 x Distance IR 20-150cm - https://www.tinkerforge.com/en/doc/Hardware/Bricklets/Distance_IR_V2.html
- 1 x Humidity - https://www.tinkerforge.com/en/doc/Hardware/Bricklets/Humidity_V2.html
- 1 x Analog out - https://www.tinkerforge.com/en/doc/Hardware/Bricklets/Analog_Out_V3.html
- 1 x Analog In - https://www.tinkerforge.com/en/doc/Hardware/Bricklets/Analog_In_V3.html
- 1 x Motion Detector - https://www.tinkerforge.com/en/doc/Hardware/Bricklets/Motion_Detector_V2.html
- 1 x Particulate Matter - https://www.tinkerforge.com/en/doc/Hardware/Bricklets/Particulate_Matter.html
- 1 x Ambient Light - https://www.tinkerforge.com/en/doc/Hardware/Bricklets/Ambient_Light_V2.html
- 1 x GPS - https://www.tinkerforge.com/en/doc/Hardware/Bricklets/GPS_V2.html
- 1 x Temperature - https://www.tinkerforge.com/en/doc/Hardware/Bricklets/Temperature.html


## Extra Peripherals

- USB GPS
- USB Webcam
- Bluetooth TI SensorTag multisensor
# Troubleshooting

## I cannot see any devices in my container

You need to be running in privileged mode with `--privileged` flag.

## My port mapping is not working

### You are running in host most
If you are running in host mode `--net=host` then the `-p` flag does not work

### Exposing the wrong port
When you type a `-p8080:3000` this means your code should be running on port
3000 inside the container and that will be mapped to port 8080 on the host.
