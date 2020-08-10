#!/usr/bin/env bash
cd client
npm run build
cd ..
rsync -rl client/app/* package/client/
rsync -rl package sandstorm-all/magnolial
cp .sandstorm-keyring sandstorm-all/magnolial/
cd sandstorm-all
vagrant ssh -c 'cd /vagrant/magnolial/package; cp ../.sandstorm-keyring /home/vagrant/; make'

mkdir ../build
cp magnolial/package/package.spk ../build/
