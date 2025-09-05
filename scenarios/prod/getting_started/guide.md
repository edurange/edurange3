# Getting Started


<!-- CHAPTER_START 1: Welcome to Cybersec -->

<!-- READING_START -->
### How to Connect
Use the credentials and IP address provided in the bottom left of this 
scenario page to SSH into the exercise. 

SSH is an important network protocol that is used in most of our 
scenarios, so you need some minimal knowledge on how to use it on your OS.

If you need a backup, you can use the WebSSH button also in the bottom 
left, but it is missing many convenience features provided by more 
standard terminals, so don't use it unless instructed to do so.

<!-- READING_END -->

<!-- QUESTION_START -->
Question: What is the full "FLAG{...}" string that is provided after ssh-ing in?

Answers:
Value: FLAG{WELCOME}
Points: 15
<!-- QUESTION_END -->

<!-- CHAPTER_END -->

<!-- CHAPTER_START 2: Command Line Interface -->

<!-- READING_START -->
## Using the Terminal Commands in the Unix shell

When using your computer (Mac, Linux, Windows), you often need to interact
with the operating system to access shared resources like disk storage 
or external hardware.

- A “*shell*” is a program that allows you to interact with the OS in text mode, also called a “***c**ommand **l**ine **i**nterface*” or CLI.

“***G**raphical **u**ser **i**nterfaces*” (GUI) are generally designed to
simplify and expedite user interactions. However, they can sometimes restrict
the user beyond that requirement. Text-based interfaces are more complex by
comparison, but they allow more freedom.

- The device and/or software that connects you to the command line can sometimes be called a “*terminal*”.
- The software that provides the command line interface itself on the host computer is called the “*shell*” because it wraps around the operating system.

#### bash and Other Shells
In eduRange we use the “***B**ourne **A**gain **Sh**ell*”, “`bash`”.

you can look up the history of bash and other shells online

## man pages and apropos
“*`man` pages*" is short for “**man**ual” pages. These are text documents with lots of information on things installed on your system. “`man`” is a command for reading the `man` pages.

The first command we explore is `ls`? Let's find that `man` page.

Type:

```sh
man ls
```
 To exit `man`, just type “`q`” to “***q**uit*”.
      
<!-- READING_END -->

<!-- READING_START -->
- `man` pages are an important resource because they are specific to the software actually installed on the system you’re currently using.
- Some commands have different behavior depending on their version.
- An online resource may or may not have information specific to your system, but `man` always contains documentation for what you have installed.

There are even entirely different implementations of some programs - including shells, as mentioned earlier. When it comes to shell information remember to ask `man` about the right shell. In eduRange that will be `man bash`, but the default shell on your own systems might vary.

### man Page Key Points: SYNOPSIS and EXAMPLES
      
For many commands, there’s an overwhelming amount of information in the `man` pages. The pages are divided up into sections.

Most every `man` page includes two particularly useful sections:
- A *synopsis* showing how the command is written in the format discussed earlier, and 
- A series of *examples* showing exact instances of the command in particular uses.

When in a `man` page, you can type a slash “`/`” to search for text.

The headers are in all capitals, so after opening up a particular page, to search for the synopsis you’d type

```sh
/SYNOPSIS
```
and then hit enter.

- `man` will highlight all instances of the text “`SYNOPSIS`”.
- Typing “`n`” will bring you to the “**n**ext” search result.
- “`b`” will take you “**b**ack”.
- Remember, “`q`” to “**q**uit” when you’re done.

What happens when your search fails?
Try searching for the “`EXAMPLES`” section in `man ls`.

As you read man pages you will notice that there are many variations on
some commands. These are expressed as options and are usually preceeded by 
a "-"

### apropos	
Because the command names can be arcane, it is helpful to know about the `apropos`
command which searches through all of the man pages.
Try

  ```sh
  apropos rename
  ```
What command best fits? Use man to find out more about it.

<!-- READING_END -->


<!-- CHAPTER_END -->

<!-- CHAPTER_START 3: Man Pages -->

<!-- READING_START -->

“*`man` pages*" is short for “**man**ual” pages. These are text documents
with lots of information on things installed on your system. “`man`” is a
command for reading the `man` pages.

Try opening the "`man`" page for `ls` using:
```
man ls
```
To exit `man`, just type "`q`" to “***q**uit*”.

### `man` Page Key Points: SYNOPSIS and EXAMPLES

For many commands, there’s an overwhelming amount of information in the `man` pages. The pages are divided up into sections.

Most every `man` page includes two particularly useful sections:

- A *synopsis* showing how the command is written in the format discussed earlier, and 
- A series of *examples* showing exact instances of the command in particular uses.

When in a `man` page, you can type a slash “`/`” to search for text.

The headers are in all capitals, so after opening up a particular page, to search for the synopsis you’d type:

```sh
/SYNOPSIS
```

and then hit enter.

- `man` will highlight all instances of the text “`SYNOPSIS`”.
- Typing “`n`” will bring you to the “**n**ext” search result.
- “`b`” will take you “**b**ack”.
- Remember, “`q`” to “**q**uit” when you’re done.

<!-- READING_END -->

<!-- QUESTION_START -->
Question: Open the `man` page for `cp`. What option would provide verbose output? It’s worth noting that many commands provide an option with this name, not just `cp`.

Answers:
Value: -v
Points: 15
<!-- QUESTION_END -->

<!-- READING_START -->
- `man` pages are an important resource because they are specific to the software actually installed on the system you’re currently using.
- Some commands have different behavior depending on their version.
- An online resource may or may not have information specific to your system, but `man` always contains documentation for what you have installed.

<!-- READING_END -->

<!-- CHAPTER_END -->

<!-- CHAPTER_START 4: Filesystem and Navigation -->

<!-- READING_START -->
# Unix Filesystems

Unix folders and files are arranged in a tree structure, where the root node is the beginning of a path to any file in the entire file system.

- The “*root node*” (or “*root directory*”) of the filesystem is written with the slash character “`/`”.
- The leaves of the tree are the individual files.
- This means that if you want to search the entire file system, you need to start at `/`.

It is common to represent the filesystem tree in a manner like this:
```
/
├── bin
├── dev
├── etc
├── home
│   ├── user1
│   ├── user2
│   └── ...
├── mnt
├── root
├── usr
│   ├── bin
│   └── ...
├── var
└── ...
```

### Exploring the Filesystem with ls

Due to its tree structure, the locations of files stored in a filesystem are called paths. A “path” can refer to both a file or a directory. 
When you begin a shell session, the directory designated for you on the system is called your “home directory”.

To see which files and directories are listed in your home directory, type:
```
ls
```

You should see something similar to:

```
bar               followMe         navigation_check.txt  you_cant_read_me.txt
comms_record.txt  for_hire.txt     permit_requests
file-practice     i                radio_logs.txt
final-task        multimedia-data  toLearn
```

These are the contents of your home directory. ls is short for “list” (files) and can be used in other parts of the file system to display files 
and directories in your “current working directory” as well.

<!-- READING_END -->

<!-- QUESTION_START -->
Question: How many files and directories are in your home directory? (EXCLUDING hidden files and . or ..)

Answers:
Value: 13
Points: 15
<!-- QUESTION_END -->

<!-- READING_START -->
## Commands and Navigation - pwd, cd, ls

Now, try:

```
ls /
```

In this case, `ls` is the command you’re invoking, and “/” is a path. Specifically, “/” will show you the contents of the root directory.

`ls` doesn’t modify any files or your environment, so you are free to look around the filesystem without worry. There will be some paths that you don’t have permission to see, but ls can be a useful tool in navigating the file system.

### pwd
pwd stands for "print working directory" - it will tell you where you are within the filesystem, your current working directory.
If you type:
`pwd`

You should see something similar to `/home/<foo>` where “foo” is your username.

### cd
“cd” stands for “change directory”, meaning to navigate to a different folder. If you are ever lost in the filesystem, cd by itself will take you back to your home directory.
Enter each of the following, one at a time. If you use ls after each, you’ll see that your working directory is changing:
```
cd /
cd /root
cd
cd ../
```

    - The first command sends you to the root of your entire file system.
    - The second command sends you to the root user's home directory, but notice that you don't have permissions to cd to that directory.
    - The third command sends you back to your home directory because no path was specified with the command.
    - The fourth command sends you backwards (up) a level in the file system using .. .

### ls and File Access Control
As mentioned before, “ls” “lists” files and directories. When using the command line, “options” allow you to tell the computer how you want it to output information. These are usually shown with a single hyphen (-) for one letter options or a double hyphen (--) for longer options. Let’s use ls to learn more about our file system.

First, make sure you’ve returned to your home directory by entering:
`cd`

Then, try:

`ls -la`

That's a lot of info! What you see are all the files and directories in the directory (folder) where you are currently working, including files that were hidden before!
There’s also a lot more information than before, so rather than a list of filenames, we get a whole table with one file per row and columns with additional information about each.
    - The first column is a string of characters indicating the type of file followed by its “permissions”, settings that determine who is allowed to use files and what they can do to them.
    - A – at the beginning means a regular file. d is a directory (folder). l is a link. The rest of the string is either - or r, w, and x.
    - r here stands for "read", w for "write" and x for "execute". - in the position of one of the letters means that type of permission is denied.
    - Permissions can be set based for 1) the user owning the file, 2) users in the group owning the file, or 3) all other users, and so the permission string repeats each rwx position three times.
    - The second column is the number of links or sub-directories in the directory, if this file is a directory. (In Unix, we tend to think of all things as files; even directories are just a special type of file.)
    - The third column is the user that owns the file.
    - The fourth is the group that owns the file.
    - The fifth is the size of the file.
    - The sixth is the date and time it was last edited.
    - And finally, the file name in the seventh column, on the far right.
Let’s learn more about what we can do with ls.

Type:
`man ls`

When we wrote `ls -la`, “-la” was a collection of options, sometimes also informally called “flags”. Options like this can be combined without spaces to give the computer multiple instructions at once.
Let's learn what “l” and “a” mean.

### Locate Option "-l"
Within the man page for ls, search for the “-l” option. Remember that to search inside a man page, you can use “/”.
Type:
`/-l`

You should see the page move to the first occurrence of “-l” and that “-l” is highlighted. Remember, you can jump to the next matching result by hitting “n” (for “next”).
Press “n” until you see “-l” highlighted at the beginning of the line; this is where the option is defined and will be above the line for “-L”.
As we can see, the “long” listing option shows results with details in columns.
Locate Option "-a"
Now, let’s find information about “-a”. Type:
`/-a`

Hit “n” till you can't go any further. Now hit “b” (which stands for “back”) until you find the entry for “-a” (which is above “-A”).
Remember when we mentioned that files can be hidden? By default, ls ignores file names that start with .. The “all” option specifies that hidden files, which start with . like .profile, should be displayed.
Hidden files aren’t hidden in the “secret” sense as much as they are just “hidden from view” to reduce visual clutter. Hidden files are often used to store configuration and other information that might repeat in many places and would be distracting if it showed up all the time.

### Globbing With ls
If there are a lot of files in a directory, it can be useful to restrict what ls looks at to a subset of those files. The shell allows you to find things in your directory following a certain pattern. This is called “globbing”. For example, if you are only interested in files with the extension “.jpg”, you can use:
`ls *.jpg`
The “*” “star” is a special character called a “wildcard”. Wildcards represent a part of the pattern that could vary. * specifically means that any string of character(s) could go in that position of the glob pattern. We’ll discuss and use globs more later on.
Now that we have learned a few basic commands, try to use this information to learn more about your filesystem.
<!-- READING_END -->

<!-- QUESTION_START -->
Question: What is the name of the hidden file in your home directory that is over 1 megabyte?

Answers:
Value: .lasers.wav
Points: 15
<!-- QUESTION_END -->

<!-- CHAPTER_END -->

<!-- CHAPTER_START 5: Naming Conventions -->
<!-- READING_START -->
## Naming Conventions

Information about your computer and users can be found by exploring the filesystem. Here are common names for the places that information is stored:

    - /, as mentioned earlier, might be called just “root” or more specifically the “root node” or “root directory”.
    - /home contains the “home” directories for all users, other than root. (On Mac OS, desktop users’ homes are in /Users instead.)
    - /usr contains common data for resources provided to all (particularly unprivileged) “users”, such as libraries and the files that man uses to deliver documentation. Many commands are stored here as well.
    - /usr/bin is where the “binary” executables in /usr are stored specifically.
    - /bin also contains binary executables, but if you ls /bin, you’ll see Reading11: &reading11
There are a number of other top-level directories related to system operation that are outside the scope of this first lesson. /etc stores shared data like configuration files; /dev and /mnt are related to how the operating system manages hardware.
You won’t need to interact with these other areas today. For now, be aware that they’re system critical and not to be changed unless you know what you’re doing.

### Navigation: Long and Complicated Paths
Typing paths can be cumbersome. Shells provide shortcuts to help.
A “.” (“dot”) is short for your “current working directory”. For now your current working directory will be the same as your home directory. 
Here are some examples to demonstrate how you can navigate in the file system using what we have learned:
    - If the current working directory is “/foo/bar”, then if you type “./baz” in the command line the current working directory will become “/foo/bar/baz”.
    - If you wanted to return to the parent directory of the current working directory (the directory backwards/up a level), you would type “..” (“dot-dot”).
    - “/..” is one exception - / is the root of all nodes, including itself, so “/..” is interpreted as just “/”.
    - . and .. only have these meanings when they are used as directory names by themselves. For example: “/..foo” means “the file or directory called ‘..foo’ in our current location”. “../foo” means “the file or directory called ‘foo’ in the parent directory of our current location.”
    - Another shortcut is “~” (“tilde”). Used by itself, ~ is interpreted as the path to your home directory.

### Tab Completion
The shell also has an auto-completion feature. Modern auto-correct algorithms share common ancestors with shell “tab completion”.
While typing a path in the command line, you can hit tab to complete a path without having to type it all out. If the path you’ve typed has more than one possible completion, the shell will prompt you with a list of possibilities. If there are a lot of possibilities the shell may warn you that it’s about to print a big list. You can then add to your command input to narrow the available choices.

### root Has More Than One Meaning
In a Unix system, control over the root directory (or root “node”) is protected by restricting it to a single user. Early systems engineers chose to call this user “root”, which became a convention. Because this user has control of the root node, and thus anything stored on the system at all, the root user became the de facto authority over most things security-related. (In Windows, this user is instead called “administrator” by default, but its role is similar.)
With both the root user and root node being important vocabulary for system administration, you'll come across ambiguities sometimes.
    - The “root” (node), signified by just “/”, is the beginning of all the system's files.
    - But if you were to log in as the “root” user, your home directory would be the folder “/root”, not the root node, “/”.
    - root’s home directory “/root” is not to be confused with the formal root directory “/”, the beginning of the path to all the files, even though they both might be casually read as “root directory” aloud.
To avoid confusion, it is best to call “/root” “slash-root” or something like “root’s home”. Reserve “root” itself to refer to the path “/” or the user “root” exclusively, specifying whether you mean a path or user when it isn’t obvious - this is generally how you can expect the terms to be used.

### About root Privileges and Security
A root user is someone who has access to everything on the computer. They could even delete everything on the computer.
When setting up your own systems, be aware of how the root user and privileges are configured and controlled. Some systems might not ask to set up credentials initially, leaving the password for root set to a default value after install. In cybersecurity, not changing this default password can have huge implications.
You won’t be using protected parts of the system in this exercise, but there are many security exploits related to them that you’ll likely encounter in the future.
<!-- READING_END -->

<!-- QUESTION_START -->
Question: In your home directory there is subdirectory named followMe. Travel into the directory as far as you can go. At the end there is a file. What is the name of the file?

Answers:
Value: $RANDOM
Points: 15
<!-- QUESTION_END -->
<!-- CHAPTER_END -->

<!-- CHAPTER_START 6: File Manipulation -->
<!-- READING_START -->
## Commands: mv, cp, and mkdir

### mv
mv is used to move or rename files and directories in the filesystem. As we discovered earlier, there is no separate command to rename a file, it is simply mv’ed from one name to another in the same directory.

### cp
cp is used to “copy” a file to a new location.

### mkdir
mkdir is short for “make directory” and does just what you’d think.
Let’s try out using mkdir!
<!-- READING_END -->

<!-- QUESTION_START -->
Question: In the file-practice directory, rename file1.txt to renamed_file1.txt and copy file2.txt to copied_file2.txt. What is the output of 'wrangle_flag' if you run it as a command?

Answers:
Value: $RANDOM
Points: 15
<!-- QUESTION_END -->

<!-- READING_START -->
### `chmod`

`chmod` comes from “***ch****ange* ***mod****e*” and alters the *permissions* of files and directories.

- “*Permissions*”, mentioned earlier with regard to `ls -l`, are the settings on each file which determine who can use that file and how.

`chmod` can be used in many ways so it takes a little more explaining than earlier commands.

If you look at `man chmod` you’ll see that `chmod` accepts several different types of input, and has a lot more features than just the basic nine permissions. The essential points are:

- `chmod` takes a mode and a file: `chmod mode file`
- “`file`” is a path to the file you’d like to change (directories are files too)
- “`mode`” can be written a number of ways; we’ll use “*symbolic mode*” here but you’ll likely see “*absolute mode*” (a numeric representation) in older examples

*Symbolic* permission modes have a lot of shortcuts associated with them but we’ll focus on the basics here.

- The mode should begin with any combination of “`u`” for user, “`g`” for group and “`o`” for other
- Then follows an operator (just one): equals “`=`” assigns precisely the following permissions to the user/group/other category, plus “`+`” adds permissions, and minus “`-`” takes them away
- Then follows a combination of “`r`” for read, “`w`” for write, and “`x`” for execute

So as examples:
To add execute permission for a user:
```
chmod u+x <filename>
```

To remove read and write permission for the group:
```
chmod g-rw <filename>
```

To add read permission for all roles:
```
chmod ugo+r <file>
```

<!-- READING_END -->

<!-- QUESTION_START -->
Question: Use chmod to make 'you_cant_read_me.txt' in your home directory readable. What is the flag it contains?

Answers:
Value: $RANDOM
Points: 10
<!-- QUESTION_END -->

<!-- READING_START -->
### Background: File Types

Not all files appear as they really are. Just because you see a file named “`foo.png`” does not mean that there is PNG image data inside. It could be a text file hiding a secret message, or contain harmful executable code, or have been named by mistake.

- File extensions are a convention for keeping things organized - not an enforced rule or a promise about what the file actually is. Whoever creates the file chooses its name and extension, however they like.

So, how can you get more information on what a file actually contains? One way is with the “`file`” command!

### `file`

To find out what a **file** really is regardless of its extension, you could examine the byte data inside, but `file` can often do this for us automatically.

Try using "`file`" to inspect the files in the "multimedia-data" directory.

<!-- READING_END -->

<!-- QUESTION_START -->
Question: In the multimedia-content directory, which file is actually an OpenSSH RSA public key?

Answers:
Value: staff_schedule2.docx
Points: 10
<!-- QUESTION_END -->

<!-- READING_START -->
### `find`

“`find`” does just what it sounds like - helps you “***find***” files on the filesystem. `find` takes different qualities that define what you’re looking for, and does the repetitive work of searching each directory in the tree work for you.

An example:

```sh
find . *foo*
```

- First the “`.`” argument is a path that tells `find` where to start the search; in this case it's the current working directory. (Remember the dot is shorthand for the directory where you are. We could also give a relative path like “`bar`” or an absolute path from the root “`/`”. Wherever you’d like to search from.)
- Second, we provide an expression for a filename. Here we’ve provided a glob pattern, “`*foo*`”. The `*`s on either side mean that we want everything with `foo` in the name, regardless of what is around it. The `*` can be any string, including an empty string, so “`foo`”, “`myfoo`”, “`foobar`” and “`space food vendors.txt`” would all be valid matches.

<!-- READING_END -->

<!-- QUESTION_START -->
Question: What is the full filename of the image containing top_secret, with the extension of .png?


Answers:
Value: do_not_share_top_secret.png
Points: 6
<!-- QUESTION_END -->

<!-- QUESTION_START -->
Question: What is the full filename of the image containing top_secret, with the extension of .gif?


Answers:
Value: still_top_secret.gif
Points: 6
<!-- QUESTION_END -->

<!-- QUESTION_START -->
Question: What is the full filename of the file containing 'top_secret' and 'meow'?


Answers:
Value: top_secret5meow.JPG
Points: 6
<!-- QUESTION_END -->

<!-- CHAPTER_END -->

<!-- CHAPTER_START 7: More File Utilities -->

<!-- READING_START -->
# More File Utilities

So far we’ve looked at commands that browse and alter the filesystem, where data is saved. Next we’ll introduce some command line programs for reading and writing the data inside files, as well as some shell features that give us greater power over storing and manipulating that data.

## Commands

First we’ll take a look at some of the essential commands. Another term for CLI commands is “*utilities*” - you may have seen it used already in the `man` pages.

### `cat`

Let's learn a new command, `cat`. `cat` prints out the text from a file.
`cat` is short for “con**cat**enate”, which means “to connect, join or arrange”. If given more than one file argument, `cat` will print out each one in the order they’re specified, joining them (on the printed output, at least).
But if you just want to print out a text file to the console, you can simply `cat <filename>`.

### `touch`

“`touch`” is a command that "*touches*" a file. If the file exists `touch` updates its modified date. If the file does not exist, then an empty file will be created at that location.

Why is this useful? There are many other ways to create new files, particularly when saving new data from other programs. But `touch` may be convenient when you only need an empty file.

Then, why does it change the modification date? This is because `touch` is actually more often used as a scripting tool, when processing and organizing files for larger tasks. You may not need to `touch` files manually very often, but chances are you’ll come across its use in a script.


### `echo`

`echo` is a simple and versatile command. It can evaluate an expression and write it to the terminal standard output (STDOUT, which we'll explain further below). You can use this in many different ways. A simple example is where the expression is a string literal.

If you type:

```sh
[username]@[host]$ echo "This is echoed"
This is echoed
```

You will see that it was repeated back to you.

### `md5sum`

“`md5sum`” is way to determine whether a file has been modified.

Since it is only a function of the file contents, it can also be used to check whether two files have the same contents.

`md5sum` is called a “*cryptographic hash function*”. A “*hash function*” maps a large, possibly infinite set of values (in this case, all possible file contents) to a smaller set of values of a fixed size (here, 128 bits). A *cryptographic* hash function does so in such a way that it is hard to construct an input that maps to a given output - thus it is not easy to infer the content of the file just by its MD5 hash.

If security is described as a balance between confidentiality, integrity and availability, commands like ‘md5sum’ help to provide the “*integrity*” property.

## Pager Utilities

“*Pagers*” are a group of command line utilities that allows users to view text one page at a time. This is particularly useful when dealing with output that is too large to fit on a single screen, as it prevents the information from scrolling past too quickly to read.

### `less` and `more`

The commands “`less`” and "*more*" are used to open larger files, page by page. they allow you more tools to read a file in an organized fashion than you might have just by scrolling through your terminal output.

Like `man` pages, you can use `q` to exit them. (Fun fact, `man` is actually built on top of `more`)

### `tail`

The “`tail`” command is used to display the last part of a file. By default, it shows the last ten lines, but you can customize its behavior using various options.

- Custom line count: Use the `-n` option to specify the number of lines to display.
- Real-time monitoring: With the `-f` option, `tail` can follow a file, displaying new lines as they are added. Run this way `tail` will continue even when it reaches the end of the file, waiting to print additional new lines. Press ^C to stop monitoring and return to the shell.

`tail` is convenient when you don’t need or want to scroll manually. `less` can follow the tail of a file too, but it takes a few more keystrokes.

<!-- READING_END -->

<!-- QUESTION_START -->
Question: What is the very first line of "navigation_check.txt" in your home directory?

Answers:
Value: Begin Nav Check: Z94732
Points: 20
<!-- QUESTION_END -->

<!-- QUESTION_START -->
Question: What is the very last line of "navigation_check.txt" in your home directory?

Answers:
Value: Date: 8764.56.14
Points: 20
<!-- QUESTION_END -->

<!-- QUESTION_START -->
Question: In the "permit_request" directory in your home directory, which file has an md5sum hash that ends with "e3e3"?:


Answers:
Value: req9A323.txt
Points: 20
<!-- QUESTION_END -->

<!-- READING_START -->
## Text Editors

There are many ways to create and modify text files on the command line. When you need all the features of an interactive text editor, there are a number of choices.

We use the minimal editor “`nano`” for most examples in eduRange unless otherwise stated. In these exercises, `nano` is all you’ll need, but we’ll mention a few common alternatives by name so you know them when you see them.

### `nano`

Like the name implies, “`nano`” is a small text editor. Called with no arguments, it opens an editor session for an unnamed file; when you go to save, it will allow you to specify a path to write out to. Called with an argument, `nano` attempts to open and read the file at the path provided. If no file exists, a new one will be created when saving.

As with `man` or `less`, once `nano` starts, it is controlled differently than the shell. If you type, your text will be entered into the file to be written. Text is inserted at the blinking cursor, which can be moved around with arrow keys. At the bottom of the screen is a summary of command keystrokes. (Remember, “`^`” is shorthand for the Control key modifier.)

The most important are:

- `^O` to “*write **o**ut*” (when you type you’re writing to a temporary buffer; it doesn’t save to the actual file until you write out)
- `^X` to “*e**x**it*”
- `^G` to “***g**et help*” if you’re curious about the others

The keystrokes are case-insensitive.

### `vim` and `vi`

You’ll probably come across references to `vim` or its predecessor `vi`. These have powerful tools related to searching and batch editing files, but we won’t have use for those features in this exercise.

If you find yourself accidentally stuck in `vim` or `vi`, hit Escape, then type `:qa!` and press enter to forcefully exit.

Vim can be very useful and productive, but it has a steep learning curve for all of its hotkeys.

<!-- READING_END -->

<!-- CHAPTER_END -->

<!-- CHAPTER_START 8: Redirection and Filters -->

<!-- READING_START -->
# Redirection, Filters and Command Composition

## Input/Output Redirection

Redirection operators - written with angle brackets like “`>`” and “`<`” - are used to write the output of a command to a file or a file to the input of a command. They have many uses.

### Output Redirection With `>` and `>>`

The “`>`” “*redirects output*” to a file. `<command> > <path>` will write a file to “`path`” with what is output by the “`command`” on the left hand side. If the file already exists, `>` will overwrite the file with what you sent it, in effect deleting the previous content. In contrast if you use `>>`, it will append what you sent to the end of the file, leaving the existing data intact.
Let's give it a try. Try:

```sh
echo "This is cool" > newfile
cat newfile
```

Next type:

```sh
echo "This is cool too" > newfile
cat newfile
```

You can see that `>` will replace any text with what you send it, while `>>` will append to a file. Enter the following:

```sh
echo "This is another thing" >> secondfile
echo "Hello World" >> secondfile
cat secondfile
```

By using `>>`, both lines were saved to `secondfile`.

Now let's use `>>` to combine the two files. Type:

```sh
cat newfile >> secondfile
cat secondfile
```

You can see the contents of `newfile` appended to the end of `secondfile` whereas if you `cat newfile` it will still only have what we wrote to it earlier.

Remember, `man bash` (or your particular shell) has the documentation on shell language features like redirection.

### Tip: Use Redirection to Filter Output Streams

One useful trick you can do with redirection operators is suppress error messages.

Say you have a command that produces lots of output (like searching through every sub-directory of a big directory with `find`) and sometimes that command produces errors (for instance when `find` tries to search a directory for which you don't have permissions).

If you want to just focus on the normal output and suppress the error messages that may result, you can add '2>/dev/null' to your command. For example:

```sh
find . filename 2>/dev/null
```

### Input and Output Redirection With Pipes `|`

`<` and `>` and their relatives help get data to and from the command line to the filesystem. The “*pipe*” operator, written as “`|`”, takes the output of one command and provides it as the input to another command. This allows you to combine the functionality of two commands in a single statement, without needing to save the intermediate data to file.

Consider a command like: `cat file1.txt file2.txt | more`

This would pass the contents of both file1.txt and file2.txt into `more`, so you could read them both in a combined pager.

Not particularly useful, but the idea is you can pass the results of one command into another with pipes. 

This becomes very powerful when using commands that "*Filter*"

## Filters

“*Filters*” are a category of commands that take input (generally text), apply some operation to the input and then print the result back out to standard output. Some examples of operations could be sorting, searching or counting.

### `sort`

The “`sort`” command is a tool that is used to **sort** lines of text. It’s handy for sorting lists that are out of order. It can sort specific columns or entire lines alphabetically, numerically, or even in reverse order.

`sort` by default will sort the list in alphabetical order according to the first letter of each line. Lowercase characters are listed before uppercase letters.

- The option `-r` sorts the list in reverse order.
- The option `-n` will sort the list numerically.
- You can sort a specific column using the option `-k` and a numeric argument.

One use for the `sort` command is to reorder the output of a shell command, such as `ls', through the use of a pipe.

That should take the form of `<source> | <filter>' where: 
- “`source`” is the `ls` output you want to `sort` and
- “`filter`” is the `sort` command and relevant options.

<!-- READING_END -->

<!-- QUESTION_START -->
Question: Take a look at the format of "comms_record.txt" in your home directory. Use "`sort`" to reorder the records based on their Stardate.
You will need to use the option that designates which column to sort over.
How many status updates were sent on date "2398.1"?


Answers:
Value: 4
Points: 10
<!-- QUESTION_END -->

<!-- READING_START -->
### `uniq`

The `uniq` command is used to reduce the number of repeated lines that are printed while viewing a file, and, as a result, it is very often used with `sort` (using a pipe). 
Such as: `cat <file> | sort | uniq`

It only prints the first instance of a line, and does not print repetitions of that line that follow after that instance. 
Though it’s called “***uniq**ue*”, `uniq` doesn’t guarantee to remove all repetitions - just those that follow one another.

<!-- READING_END -->

<!-- QUESTION_START -->
Question: How many unique jobs are available on the ship according to "for_hire.txt" - Remember that `uniq` requires sorted input.

Answers:
Value: 13
Points: 10
<!-- QUESTION_END -->

<!-- READING_START -->

### `grep`

The “`grep`” command has a similar use to `find`, however, instead of searching for files, `grep` searches within files for lines that contain a string you specify. Unlike the *glob patterns* used by `find`, `grep` uses a convention called *regular expressions*.

“`grep`” stands for “**g**lobal / **r**egular **e**xpression search / and **p**rint” - originally it was a series of commands in an editor, but was so useful someone turned it into a utility of its own. The general syntax of the command is:

`grep [pattern] [file ...]`

Some options for `grep` include:

- Case insensitivity (“`-i`”)
- Only print the filename that contains the pattern (“`-l`”)
- Print out line numbers along with the matching criteria (“`-n`”)
- Print lines that do not match the criteria (“`-v`”).

#### Regular Expressions

“*Regular expressions*” are another style of text patterns. They have similar basic uses to globs, but are much more complex and powerful. We’ll only present a few of their applications here.

First, note that some symbols and ideas are shared between regular expressions (“*regexes*”) and glob-style patterns. The “`*`” is not a wildcard in a regex, but it does something similar; when “`*`” follows a sub-pattern in a regex, the resulting pattern matches zero or more occurrences of the sub-pattern.

Regexes allow you to specify the number of matches separately from the expression that is matched, whereas glob wildcards do both in a single symbol. Here globs are shorter, but regexes are more flexible.

### Combine the filters flexibly

Putting it all together, you can chain these filters in a number of different ways.

Say if you wanted to read a file, look only at lines that contain "foo", and then filter down to only unique lines, you could do something like:

```
cat <file> | grep -i "*foo*" | sort | uniq
```

<!-- READING_END -->

<!-- QUESTION_START -->
Question: How many unique *sender* ip addresses are in radio_logs.txt?

Answers:
Value: 24
Points: 20
<!-- QUESTION_END -->

<!-- CHAPTER_END -->

<!-- CHAPTER_START 9: ending -->

<!-- QUESTION_START -->
Question: In the "final-task" directory in your home directory, there is a file called "hidden-instructions.txt". 
Combine all the skills you've learned so far to find and follow the instructions inside.


Answers:
Value: $RANDOM
Points: 15
<!-- QUESTION_END -->

<!-- CHAPTER_END -->

