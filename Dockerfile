FROM dxflrs/garage:v2.5.0
# StartOS mounts into /etc and /proc without creating them, and the scratch upstream image has neither.
WORKDIR /etc
WORKDIR /proc
WORKDIR /
