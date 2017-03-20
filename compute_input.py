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
    currentArray = []
    num_params = int(sys.argv[1])

    # if (sys.stdin.isatty()):
    #     serverData = sys.stdin.readLines()
    #     for x in range(0, num_params):
    #         # sys.stderr.write('THIS IS AN IMPORTANT EMSSAGE')
    #         currentArray.push(serverData[x])

    currentArray = [2, 3, 4, 5]
    while (learn): 
        for x in range(0, num_params):
            sys.stdout.write(str(currentArray[x]), + '\n')
            
            if (sys.stdin.isatty()):
                lines = sys.stdin.readLines()
                if (lines == 'STOP'):
                    learn = False

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