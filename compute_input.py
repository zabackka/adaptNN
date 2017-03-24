## compute_input.py

import sys, json, numpy as np
import random

def main():
    num_params = int(sys.argv[1])
    
    msgNum = 0

    while (True):
        if not sys.stdin.isatty():
            msg = sys.stdin.readline() 
            # msgOut = str(random.random()) + "\n"
            sys.stdout.write(str(msg) + "\n")
            sys.stdout.flush()
            msgNum = msgNum + 1


#start process
if __name__ == '__main__':
    main()