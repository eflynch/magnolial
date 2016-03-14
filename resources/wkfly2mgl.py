import json

with open('workflowy.wkfly') as f:
    trunk = {'childs':[]}
    previousIndent = -1
    previous = trunk
    inNote = False
    mostRecentFromLevel = {-1: trunk}
    for r in f:
        if '-#-' in r:
            inNote = False
            indentLevel = r.index('-#-') / 2
            newNode = {'value': r.strip()[3:], 'note': '', 'childs':[], 'collapsed':True}
            mostRecentFromLevel[indentLevel-1]['childs'].append(newNode)

            previousIndent = indentLevel
            previous = newNode
            mostRecentFromLevel[indentLevel] = newNode

        else:
            if not inNote:
                inNote = True
                previous['note'] = r.strip()[1:]
            else:
                previous['note'] = previous['note'] + '\n' + r.strip()

    with open('workflowy.mgl', 'w') as g:
        g.write(json.dumps({'trunk':trunk}))
