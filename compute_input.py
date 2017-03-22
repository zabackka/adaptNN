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
    num_params = int(sys.argv[1])
    currentArray = [2, 3, 4, 5]
    
    while (learn):
        sys.stdout.write(str(num_params) + '\n')
        sys.stdout.flush()
        num_params = num_params + 1
        
        lines = sys.stdin.readline()
        sys.stdout.write(str(lines) + '\n')
        sys.stdout.flush()

        
        if (num_params > 9):
            learn = False


#start process
if __name__ == '__main__':
    main()