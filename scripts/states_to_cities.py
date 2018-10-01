import json

folder_path = 'boundaries/states/ZillowNeighborhoods-'
out_path = 'boundaries/cities2/'
end = '.json'

states = ['AK', 'AL', 'AR', 'AZ', 'CA', 'CO', 'CT', 'DC', 'DE', 'FL', 'GA', 'HI', 'IA', 'ID', 'IL', 'IN', 'KS', 'KY', 'LA', 'MA', 'MD', 'ME', 'MI', 'MN',
          'MO', 'MS', 'MT', 'NC', 'ND', 'NE', 'NH', 'NJ', 'NM', 'NV', 'NY', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VA', 'VT', 'WA', 'WI', 'WV']

default = {
    'type': 'FeatureCollection',
    'features': []
}

i = 0
for st in states:
    i += 1
    with open(folder_path + st + end, 'r') as file:
        js = json.load(file)

    feats = js['features']
    cities = {}
    for f in feats:
        city = f['properties']['City']
        if city in cities:
            cities[city].extend([f])
        else:
            cities[city] = [f]

    for c in cities:
        default['features'] = cities[c]
        with open(out_path + c + end, 'w') as out:
            json.dump(default, out, indent=2)

    print 'Finished collecting state: ' + st + \
        ' | ' + str(i) + ' out of ' + str(len(states))
