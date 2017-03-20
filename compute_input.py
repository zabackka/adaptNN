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
    sendBack = [1, 3, 3, 4, 5]
    # for x in sendBack:
    #     print (x)
    #     sys.stdout.flush()
    sys.stdout.write(str(57) + '\n')
    sys.stdout.flush()
    sys.stdout.write(str(57) + '\n')
    sys.stdout.write(str(57) + '\n')
    sys.stdout.write(str(57) + '\n')
    sys.stdout.write(str(57) + '\n')
    sys.stdout.write(str(57) + '\n')



#start process
if __name__ == '__main__':
    main()