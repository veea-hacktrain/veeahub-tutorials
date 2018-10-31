# Super important things to note

- VeeaHubs run on ARM processors
- VeeaHubs run programs inside Docker containers
- Each example has 2 Dockerfiles. Ensure you build for the correct architecture.

# Architectures

- arm32v7
    - VH05
- arm64v8
    - VH06

# Container registries

Each Master Node contains a docker registry for use during development. After
development this registry is not available.
