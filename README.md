# magnolial #
I used to use workflowy to organize my thoughts, make outlines, keep track of lists, etc.
I got tired of not having control over it and wanted to make customizations. It seemed
easy enough to make clone for myself. This is it!

## client

To build the client, install NodeJS (e.g. with `brew install node`). Then `cd client; npm install; npm run build`.

It's a redux app mostly built with ReactJS.

## server

To run the server (you need to have built the client), install Python3 however you like. You also need to install postgresql in some way, maybe with `brew install postgresql`.

Then, `cd server; pip install -r requirements.txt; python magnolial.py`.

