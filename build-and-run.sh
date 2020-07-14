#!/bin/bash
PORT = 49160
CONTAINER_TAG = k-pop-infovis

if [ -z $1 ]; then
	PORT = $1
else
	echo "Using default port $PORT. You can set your own port by typing sh $0 <port-number>"
fi

docker build -t $CONTAINER_TAG .
docker run -p $PORT:8080 -d $CONTAINER_TAG