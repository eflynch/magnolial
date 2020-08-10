#!/usr/bin/env bash
cd client
npm run devbuild
cd ..
rsync -rl client/app/* package/client/
rsync -rl package sandstorm-all/magnolial
cd sandstorm-all
vagrant ssh -c 'cd /vagrant/magnolial/package; sudo make dev'
