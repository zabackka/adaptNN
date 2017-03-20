## compute_input.py

import sys, json, numpy as np

#Read data from stdin
def read_in():
    lines = sys.stdin.readlines()
    #Since our input would only be having one line, parse our JSON data from that
    return json.loads(lines[0])

def main():
    #get our data as an array from read_in()
    #lines = read_in()

    #return the sum to the output stream
    learn = True
    currentArray = [1, 2, 3, 4]
    while (learn): 
        for x in currentArray:
            sys.stdout.write(str(x) + '\n')
            sys.stdout.flush()

        while (sys.stdin.isatty()):
            serverMsg = sys.stdin.readLines()
            if (serverMsg == 'ERROR'):
                # do something
                learn = False
        sts.stdout.close()
        learn = False





#start process
if __name__ == '__main__':
    main()