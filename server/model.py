import json

import psycopg2 as psql


def _connect():
    return psql.connect("dbname=magnolia")


class ModelException(Exception):
    pass


class MagnoliaModel:
    def __init__(self, magnolia_id, create=False, read_only=False):
        self.magnolia_id = magnolia_id
        self.create = create
        self.read_only = read_only
        self._conn = _connect()
        self._cursor = self._conn.cursor()

    def __enter__(self):
        self._conn.__enter__()
        self._cursor.__enter__()
        if self.read_only:
            query = "SELECT serialized FROM magnolia where name=%(name)s"
        else:
            query = "SELECT serialized FROM magnolia WHERE name=%(name)s FOR UPDATE"

        self._cursor.execute(query, {'name': self.magnolia_id})
        ret = self._cursor.fetchone()
        if not ret:
            if not self.create:
                raise ModelException("Failed to find Magnolia")

            self._cursor.execute(query, {'name': MagnoliaModel.create(self.magnolia_id)})
            ret = self._cursor.fetchone()
            if not ret:
                raise ModelException("Failed to find Magnolia after creation")
        else:
            if self.create:
                raise ModelException("Found an existing magnolia")

        self._magnolia = [ret[0]]
        return self._magnolia

    def __exit__(self, *args):
        if not self.read_only:
            self._cursor.execute(
                "UPDATE magnolia SET serialized=%(serialized)s WHERE name=%(name)s",
                {
                    'serialized': json.dumps(self._magnolia[0]),
                    'name': self.magnolia_id
                })
            self._conn.commit()
        self._cursor.__exit__(*args)
        self._conn.__exit__(*args)

    @staticmethod
    def create(name):
        conn = _connect()
        with conn.cursor() as cursor:
            cursor.execute("SELECT (id) from magnolia where name=%(name)s", {"name": name})
            if cursor.rowcount != 0:
                raise ModelException("Magnolia with this name already exists")
            magnolia = {
                "childs": [{
                    "childs": [],
                    "collapsed": False,
                    "value": None}],
                "value": None,
                "collapsed": False
            }
            cursor.execute("INSERT INTO magnolia (name, serialized) VALUES (%(name)s, %(serialized)s)", {
                'name': name,
                'serialized': json.dumps(magnolia)
                })

        conn.commit()
        conn.close()
        return name
