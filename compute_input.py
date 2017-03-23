## compute_input.py

import sys, json, numpy as np
import random

def main():
    num_params = int(sys.argv[1])
    # msg = str(random.random()) + "\n"
    msgNum = 0

    while (True):
        if not sys.stdin.isatty():
            msg = sys.stdin.readline() 
            sys.stdout.write(str(msgNum) + "\n")
            sys.stdout.flush()


#start process
if __name__ == '__main__':
    main()