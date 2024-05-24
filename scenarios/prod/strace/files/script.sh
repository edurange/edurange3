#!/bin/bash
echo "a" > foo.txt
echo "bc" >> foo.txt
echo `id -u` >> foo.txt
chmod 644 foo.txt
secret_fork
more foo.txt | wc
