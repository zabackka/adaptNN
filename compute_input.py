## compute_input.py

import sys, json, numpy as np

#Read data from stdin
def read_in():
    lines = sys.stdin.readlines()
    #Since our input would only be having one line, parse our JSON data from that
    return json.loads(lines[0])

def main():
    #get our data as an array from read_in()
    lines = read_in()

    #create a numpy array
    np_lines = np.array(lines)

    #use numpys sum method to find sum of all elements in the array
    lines_sum = np.sum(np_lines)

    #return the sum to the output stream
    sendBack = [1, 2, 3, 4, 5]
    numSum = 0
    for x in sendBack:
        numSum = numSum + x

    sys.stdout.write(127.003)
    sys.stdout.write(numSum)

#start process
if __name__ == '__main__':
    main()