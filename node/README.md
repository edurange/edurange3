This is a standalone / microservice style chat app for use the in the larger eduRange project.
It is currently being developed for websocket connection with .csv logging.  

*****
Important correction / note on React "entry" :
*****

It was previously the case that React apps would need to use another server
to create the index.html, which would then essentially invoke React by way
of a script tag, creating the "entry".

With Vite, this is no longer the case.  Instead, the Vite server loads the index.html 
itself, which it has 'enhanced' in certain ways, and made compatible with itself.

In other words, the index.html will remain in the root directory, while the
React files will remain in the /src directory.  

Express files, having nothing to do with any of this directly, will remain in the root
directory.

Notes on connection:

  Now that Vite is handling both the index.html and the React component that inserts into
  it, the user's browser should be trying to connect to the port of the Vite server, NOT
  the express server, as previously was the case.

Notes on database / log:

Currently, the code is set up to use postgreSQL, but we are also adding a process to create
.csv log files.  The DB will be for easy UI read/write purposes, and the .csv will be for
more portable and long term storage of chat logs.

As this process is still in flux, please consider the database and .csv portions WIP.

- Jonah

# Start Vite Server:
`run start dev`

# Start Express Server:
=======
`node chatSocket.js` (or better yet, if you have nodemon: `nodemon chatSocket.js` )
