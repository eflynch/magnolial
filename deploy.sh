#!/usr/bin/env bash
cd client
npm run devbuild
cd ..
rsync -rl client/app/* sandstorm/client/
rsync -rl sandstorm/ ~/stuff/sandstorm/magnolial/
