FROM ubuntu:14.04

ENV PYTHON_ENV production
ENV GUNICORN_NUM_WORKERS 12
ENV GUNICORN_BIND_HOST 0.0.0.0
ENV GUNICORN_BIND_PORT 9911

RUN apt-get -y update --fix-missing
RUN apt-get -y install software-properties-common
RUN add-apt-repository ppa:mc3man/trusty-media
RUN apt-get -y update --fix-missing
RUN apt-get -y dist-upgrade
RUN apt-get -y install make gcc libffi-dev libssl-dev
RUN apt-get -y install curl wget python python-dev python-pip git-core vim gfortran

RUN pip install virtualenv==15.1.0
ADD requirements.txt /workdir/requirements.txt
RUN mkdir -p /workdir && cd /workdir && virtualenv env && ./env/bin/pip install numpy && ./env/bin/pip install -r requirements.txt

WORKDIR /workdir
ADD . /workdir

RUN mkdir -p data
RUN mkdir -p log

EXPOSE 9911
CMD ["make", "gunicorn"]
