import theano
import theano.tensor as T
import theano.tensor.nnet as nnet

import numpy
import sys
import json

## INITIAL THEANO CONFIG ##
# set verbosity of theano exceptions
theano.config.exception_verbosity = 'high'
# change default float type
theano.config.floatX = 'float64'

## NodeJS PROCESS HANDLING ##
# main() is called when Node spawns new child
def main():
	num_params = int(sys.argv[1])
	
	# build NN structure
	l1 = FullyConnectedLayer(num_params, 1)
	net = Network([l1], performance_goal=0.80)
	
	# continously listen for new data from server
	while (True):

		## SERVER HANDLING ##
		# when a new message is received, parse & execute NN functions
		if not sys.stdin.isatty():
			
			# read in line from server
			msg = sys.stdin.readline()
			# parse message
			msg = json.loads(msg) 

			## PARSE TRAINING DATA ##
			params = msg[0]
			performance = msg[1]
			num_params = int(len(params))

			train_datax = numpy.empty((1, num_params))
			train_datay = numpy.empty(1)
			train_datay[0] = performance
			
			for x in range(0, num_params):
				# sys.stderr.write(str(x));
				train_datax[0][x] = params[x] 

			## LEARN FROM NEW DATA ##
			train_data = load_data(train_datax, train_datay)
			train_x = net.train_batch(train_data, learning_rate=0.03)
			sys.stderr.write("PREDICTION: ")
			# sys.stderr.write(str(net.output.eval()))

			# store modified input values and parse
			store = train_x.eval()
			sendBack = []
			
			for x in store[0]:
				sendBack.append(x)

			## RESPOND TO SERVER WITH NEW DATA ##
			sys.stderr.flush()
			# send modified input values back to server
			sys.stdout.write(json.dumps(sendBack) + "\n")
			sys.stdout.flush()


# structure data into a format usable for NN
def load_data(train_datax, train_datay): 
	# temporarily create dummy vars -- will parse real data later
	# create training data
	# train_datax = numpy.ones((30, 5))
	# train_datay = numpy.zeros(30)
	
	train_data = [train_datax, train_datay]
	
	# define shared(), which turns x & y data to shared variables
	def shared(data):
		shared_x = theano.shared(numpy.asarray(data[0], dtype=theano.config.floatX), borrow=True)
		shared_y = theano.shared(numpy.asarray(data[1], dtype=theano.config.floatX), borrow=True)
		return shared_x, shared_y
	
	# return training data
	return shared(train_data)

class FullyConnectedLayer(object):
	def __init__(self, n_input, n_output, W=None, b=None, activation=None):

		#store # of input & output values
		self.n_input = n_input
		self.n_output = n_output

		# configure initial weight values
		if W is None:
			# initialize W_values to hold random weight values
			W_values = numpy.array(numpy.random.rand(n_input, n_output), dtype=theano.config.floatX)

			# print("weight values:")
			# print(W_values)

			# create W, a shared variable that holds the weight values for this layer
			W = theano.shared(value=W_values, name='W', borrow=True)
		
		# configure initial bias values
		if b is None:
			# initialize b_values to a vector of ones
			b_values = numpy.ones((n_output,), dtype=theano.config.floatX)
			# create b, a shared variable that holds the bias    for this layer
			b = theano.shared(value=b_values, name='b', borrow=True)

		# store W and b for this layer for later use
		self.W = W
		self.b = b

		# store params for easy access later
		self.params = [self.W, self.b]

		# store the activation function for this layer
		self.activation = activation

	def set_input(self, input):
		# calculate the output values for this layer
		#		dot product of (input values) and (weight values + bias) will give you
		#		the value that each node in the hidden layer will hold and pass onto
		#		the next layer [will apply activation function if necessary]
		self.input = input
		

		# feed forward
		#	multiply the input values by their corresponding weights (& add bias)
		output = (T.dot(self.input, self.W) + self.b)
		output = output.T

		# apply activation function (if applicable)
		self.output = (
			# no activation function applied
			output if self.activation is None
			# apply activation function and store values in self.output
			else self.activation(output)
		)

	def input_cost(self, net):
		return T.mean((self.output - net.performance_goal))

	# define the cost of this layer
	def network_cost(self, net):
		return T.mean(T.pow((self.output - net.y), 2))

	# compute the average error of a training batch
	def accuracy(self, net):
		return T.mean(self.output - net.y)



class Network(object):
	def __init__(self, layers, performance_goal):
		# store list of layers for this net & performance goal for this environment
		self.layers = layers
		self.performance_goal = performance_goal

		# symbolic variables that will be set during SGD
		self.x = T.matrix("x")
		self.y = T.dvector("y")
		
		# store the parameters of each layer in the network
		# create a list of all shared variables in the network [all W/b variables]
		self.params = [param for layer in self.layers for param in layer.params]
		
		# set the input for the first layer
		layers[0].set_input(self.x)

		# sets input for all other layers
		# (input of each layer is the output of its predecessor)
		for i in range(1, len(layers)): 
			layers[i].set_input(layers[i-1].output)

		# output of the network is equal to 
		# 	the output of the last layer in the net
		self.output = layers[-1].output

	def train_batch(self, train_data, learning_rate):
		# separate training data into x & y
		train_x, train_y = train_data

		### LAYER updates ###
		# calculate the cost of the net's prediction
		network_cost = self.layers[-1].network_cost(self)

		# all values in self.params are shared variables
		# calculate the gradients for each param (W/b) in the network
		layer_gradients = T.grad(network_cost, self.params)

		# define how to update the network weights & biases after the forward pass
		network_updates = [(param, param-learning_rate*grad) for param, grad in zip(self.params, layer_gradients)]

		### INPUT updates ###
		input_cost = self.layers[-1].input_cost(self)

		input_gradients = T.grad(input_cost, self.x)
		environment_updates = [(train_x, train_x-learning_rate*input_gradients)]

		# holds a dummy variable for input
		i = T.lscalar()

		# define the train() function, which completes one "pass" through the network & updates weights
		# this passes one batch of test data through the net
		train = theano.function([i], 
			[network_cost], 
			updates=network_updates,
			givens={self.x: train_x,
					self.y: train_y},
			on_unused_input='ignore')

		# update the input params based on their effect on network output
		# does one input update based on a batch of data
		modify_environment = theano.function([i],
			[input_cost],
			updates=environment_updates,
			givens={self.x: train_x,
				   self.y: train_y},
			on_unused_input='ignore')

		predict = theano.function([i],
			[self.output * i],
			on_unused_input = 'ignore')

		# print("--->initial input values: ")
		# print(train_x.eval())
		# train(0)
		# modify_environment(0)
		# print("---> modified input values: ")
		# print(train_x.eval())	

		# sys.stderr.write("initial input values: " + str(train_x.eval()) + "\n")
		train(0)
		# modify_environment(0)
		# sys.stderr.write("modified input values: " + str(train_x.eval()) + "\n")

		return train_x





# param cost will be: grad(forward_pass, wrt=input)
# train_data = load_data()




if __name__ == '__main__':
    main()









