#!/bin/sh
mkdir ../.keys
openssl genrsa -out ../.keys/private.pem 2048
openssl rsa -in ../.keys/private.pem -outform PEM -pubout -out ../.keys/public.pem