## Description
Strace (dynamic analysis of binaries) poses the challenge of understanding what a process is
doing based on its system calls. You will learn to filter large amounts of data to distinguish
between normal and anomalous behavior.

## Background
One of the important skills of cyber security is being able to analyze malware. These skills
overlap with debugging, except that the problems can be more subtle. This exercise focuses on
dynamic analysis of programs, i.e. analyzing what a program does while it is running. It turns out
that in order to do anything, a program or process relies heavily on the operating system. The
system call (syscalls) can reveal a lot about what the program is doing. One of the tools for
examining the syscalls is strace. You should first figure out where the strace binary is located
and what some of the options are (look at the man pages)

You will start with whitebox testing of some programs for which you have the source code. Then,
you can move to blackbox testing using trace files. When reading through the traces, you will
first need to figure out what the system calls are doing. The system calls also have man pages.
The last strace in this example has two executables running. If you are working in a group, think
about how you can divide up the work in an efficient way.

## Learning Objectives
- Know how to analyze the sequence of sys calls and recognize patterns
- Be able to determine if a program is behaving as expected
- Recognize when a process forks another process
- Recognize when a process opens a file or socket
- Recognize when a process deletes a file
- Recognize which system calls introduce threats and how that happens

## First Traces
Your home directory contains various files that will be used in this scenario. One is the file
empty.c, whose contents are:
`int main () {}`

Compile this program as follows
`gcc -o empty empty.c`

Now run strace to execute the empty program:
`strace ./empty`

To see a summary and count of all the syscalls used, you can add the -c flag such as:
`strace -c ./empty`

There are additional arguments to provide summary statistics or filter your output, check
`man strace` for more information.

<question 1>

The file hello.c contains this simple program:
```
#include <stdio.h>
int main () {
printf("hello\n");
}
```

Compile hello.c to hello and execute it with strace:
```
gcc –o hello hello.c
strace ./hello
```
<question 2>

The -o option of strace writes its output to a file. Do the following:
```
strace -o empty-trace ./empty
strace -o hello-trace ./hello
diff empty-trace hello-trace
```

Discussion Question: Is this an effective way to determine the differences between these traces?
Why or why not?

## Second Traces

Use a text editor to read the source code contents of copy.c

Notice the new functions we're using, such as:
```
fopen()
snprintf()
fprintf()
```
How might these C functions be invoked in syscall form?

<question 3>

## Reverse Engineering a Trace

The file strace-identify was created by calling strace on a command. The first line of the trace
has been deleted to make it harder to identify. Determine the command on which strace was
called to produce this trace. Do not include "strace" in your answer.

<question 4>

## Trace Filtering

Sometimes strace prints out an overwhelming amount of output. One way to filter through the
output is to save the trace to a file and search through the file with grep. But strace is equipped
with some options that can do some summarization and filtering. To see some of these, try the
following, and explain the results:
```
find /etc/dhcp
strace find /etc/dhcp
strace -c find /etc/dhcp
strace -e trace=file find /etc/dhcp
strace -e trace=open,close,read,write find /etc/dhcp
```

<question 5>

## Mystery Files
The file mystery is an executable whose source code is not available. Use strace to explain
what the program does in the context of the following examples:
```
./mystery foo abc
./mystery foo def
./mystery baz gh
```

<question 6>

Processes will often spawn child tasks, or "forks", which may not be as easy to trace.

Here is a simple shell script in script.sh:
```
#!/bin/bash
echo "a" > foo.txt
echo "bc" >> foo.txt
echo ‘id -urn‘ >> foo.txt
chmod 750 foo.txt
cat foo.txt | wc
chmod 644 foo.txt
``

Compare the outputs of the following calls to strace involving this script. Explain what you see in
the traces in terms of the commands in the script.

```
strace ./script.sh
strace -f ./script.sh
```

Discussion: What didn't you see it doing without the -f flag?

<question 7>

## What's wrong with that cat?

Create a one-line “secret.txt” file. Here’s an example, though of course you should choose
something different as your secret:
```
echo "My phone number is 123-456-7890" > secret.txt
```
Now display the secret to yourself using cat:
```
cat secret.txt
My phone number is 123-456-7890
```

Is your secret really secret? How much do you trust the cat program? Start by running strace on
cat secret.txt to determine what it's actually doing. Based on this and subsequent experiments,
determine answers to the following questions:

Discussion question: What is this cat doing that you wouldn't expect? What is the end result of this cat?

<question 8>
<question 9>
<question 10>

Discussion questions: 
How do you think the trojaned cat program was implemented?

```
