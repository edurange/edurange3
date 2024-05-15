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
Is this an effective way to determine the differences between these traces?
Why or why not? (ESSAY)


