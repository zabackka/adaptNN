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
    
    sys.stdout.write(str(num_params) + '\n');
    sys.stdout.flush()

    while (sys.stdin.isatty()):
        lines = sys.stdin.readLines()
        # sys.stdout.close()

    # while (learn): 
    #     for x in range(0, num_params):
    #         sys.stdout.write(str(currentArray[x]), + '\n')
    #         sys.stdout.flush()

    #         while (sys.stdin.isatty()):
    #             lines = sys.stdin.readLines()
    #             if (lines == 'STOP'):
    #                 learn = False

            # while (sys.stdin.isatty()):
            #     serverMsg = sys.stdin.readLines()
            # if (serverMsg == 'ERROR'):
            #     # do something
            #     learn = False
        
            # if (serverMsg == 'DONE'):
            #     learn = False
            #     sys.stdout.close()







#start process
if __name__ == '__main__':
    main()