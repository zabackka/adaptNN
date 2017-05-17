A thesis project to fulfill the requirements for my Master's degree. 
​
For this project, I wanted to focus on how machine learning could be applied to adapt a user's environment in real-time in order to achieve some goal.
The project had three basic components: 
​
1) The testing environment, which was a simple web game built using javascript 
2) The bulk of the project, which was the actual neural network written in Theano that performs the learning that makes the project work
3) The AWS configuration, which consists of an EC2 instance that runs both the server and client side code, making the learning possible
​
The Test Environment
In order to test my NN, I created a simple game called "Avoidance." The user controls a blue block using arrow keys, while trying to avoid pink blocks that pass across the screen. The goal of the game is to have minimal collisions. The key elements of this test environment are: 
- measurable user performance
- modifiable environment parameters that can be passed to the NN (such as player/enemy speed or size)
​
The Neural Network
The Theano code consists of a modified neural network, which has two components: 
1) simple prediction of user performance - the net learns over time to correctly predict a unique user's performance, given the environment parameters as input
2) modify the user's environment in order to achieve some performance goal -- given some pre-defined performance goal (ex. 80% accuracy) the net will perform a modified gradient descent on the current input parameters in order to change the user's environment in an attempt to get closer to that goal
​
The unique aspect of this NN is that it's self-feeding: after each pass through the network and back, a modified backpropagation is performed on the input values to create new input values that will be applied to the user environment in real time, tested and then used as the next labeled data sample.

AWS Communication
In order to get this code up and running, using an AWS EC2 instance was necessary. Running the code in the cloud allowed for enough memory to execute the learning algorithm quickly (which was very important, given that the problem space existed in real time) and efficiently. 
The testing site is hosted using NodeJS running on an EC2 instance, and all the code is run on a remote linux server (specifically, the Deep Learning Linux AMI via the AWS Marketplace). 
​
For a more in-depth explanation of the model and how it works, please refer to the "Getting Started" pdf. 
