FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt update && \
    apt install -y software-properties-common wget curl file build-essential && \
    add-apt-repository universe && \
    apt update && \
    apt install -y asterisk && \
    rm -rf /var/lib/apt/lists/*

COPY configs/ /etc/asterisk/
EXPOSE 5060/udp 5061/tcp 8088

CMD ["asterisk", "-f"]
