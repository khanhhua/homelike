#!/usr/bin/env bash
docker run --name=dev-consul -e CONSUL_BIND_INTERFACE=eth0 -p 8500:8500 -p 8600:8600 consul