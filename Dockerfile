FROM alpine:3.21 AS builder

RUN apk add --no-cache busybox-static && \
    echo "root:x:0:0:root:/root:/bin/sh" > /tmp/passwd && \
    echo "nobody:x:65534:65534:nobody:/nonexistent:/bin/false" >> /tmp/passwd && \
    echo "root:x:0:" > /tmp/group && \
    echo "nobody:x:65534:" >> /tmp/group && \
    mkdir -p /tmp/bin && \
    cp /bin/busybox.static /tmp/bin/busybox && \
    ln -s busybox /tmp/bin/sh && \
    ln -s busybox /tmp/bin/grep && \
    ln -s busybox /tmp/bin/cut && \
    ln -s busybox /tmp/bin/head && \
    ln -s busybox /tmp/bin/awk && \
    ln -s busybox /tmp/bin/echo && \
    ln -s busybox /tmp/bin/sleep

FROM dxflrs/garage:v2.2.0

COPY --from=builder /tmp/passwd /etc/passwd
COPY --from=builder /tmp/group /etc/group
COPY --from=builder /tmp/bin/ /bin/
