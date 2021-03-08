#!/usr/bin/env bash


curl -X POST -H "Accept: application/json" -H "Content-type: application/json"  -d '{
    "html": "<b>hello world <img src=\"https://www.placebear.com/400/300\"/></b>"
}' 'http://localhost:2305/1/pdf' --output test.pdf

curl -X POST -H "Accept: application/json" -H "Content-type: application/json"  -d '{
    "html": "<b>hello world <img src=\"https://www.placebear.com/400/300\"/></b>"
}' 'http://localhost:2305/1/screenshot' --output img.png