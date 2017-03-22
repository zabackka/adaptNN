## compute_input.py

import sys, json, numpy as np
import random

def main():
    num_params = int(sys.argv[1])
    
    performance = sys.stdin.readline()
    sys.stdout.write(str(performance) + "\n")
    # sys.stdout.write(str(random.random()) + "\n")
    sys.stdout.flush()


#start process
if __name__ == '__main__':
    main()