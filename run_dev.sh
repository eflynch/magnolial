#!/usr/bin/env bash
trap "kill 0" EXIT
cd client
npm run watch &
cd ..
rsync -rl client/app/* package/client/
rsync -rl package sandstorm-all/magnolial
cp .sandstorm-keyring sandstorm-all/magnolial/
cd sandstorm-all
vagrant ssh -c 'cd /vagrant/magnolial/package; cp ../.sandstorm-keyring /home/vagrant/; sudo make dev'
