
There are 3 tokens that are used with the edurange3 app.
In addition, SSL certificates are (generally speaking)
required to use and develop the app.

TOKENS:
    + JWT:  JavaScript Web Token:  An elegant method for authenticating.
            
            When JWTs are created, the creator includes a 'payload', 
            which generally takes the form of a simple JSON style object.

            The secret key is then used in combination w/ the payload to
            generate the token signature, which prevents tampering.
            
            This means that any app can verify the authenticity of JWTs
            if they have the secret key value, but the payload can't be altered
            without a value mismatch between expected signature and actual.

            IMPORTANT:  Because JWTs contain all the system requires to
            authenticate your requests, protect JWTs the same way you
            would a password.  This is also why SSL certs are important.

            Another note:  The previous point is also why the JWT is
            held in the user's browser as HTTP-only.  This means that
            the DOM (and JS) does not have access to the value.  This
            setup means that a XSS attack can't make you submit your JWT
            with the use of JavaScript injection.

 