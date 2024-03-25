# edurange2/ubuntu-sshd 

FROM rastasheep/ubuntu-sshd:16.04
RUN apt update
RUN apt install -y net-tools \
                   nmap \
                   strace \
                   less \
                   sudo \
                   cron \
                   python3-pip \
                   man \
                   vim \
                   iptables \
                   cowsay \
                   fortune
                   
RUN touch /usr/local/src/merged-logs.csv && \
    touch /usr/local/src/raw-logs.zip

RUN apt clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*
CMD ["/usr/sbin/sshd","-D"] 
