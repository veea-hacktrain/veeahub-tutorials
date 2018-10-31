# To develop

```bash
npm install --production
```

# To deploy

Note: we `cd tutorials` because there are some common files which are shared
across other tutorials. This means we don't pollute the repo with duplicates

```
cd tutorials
docker build --file=sensors/tinkerforge/temperature/javascript/Dockerfile.arm32v7 .
```
