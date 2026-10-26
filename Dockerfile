FROM dxflrs/garage:v2.5.0
# StartOS 0.4.0.3 cannot start a subcontainer from an image without /etc, and the scratch upstream image has none.
WORKDIR /etc
WORKDIR /
