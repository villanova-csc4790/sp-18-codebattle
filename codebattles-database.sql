DROP TABLE problems.Attempt;
DROP TABLE problems.problem;

CREATE TABLE problems.problem 
(
    ProblemId INT NOT NULL AUTO_INCREMENT,
    description VARCHAR(5000) NOT NULL,
    test_case VARCHAR(5000) NOT NULL,      
    expected_output VARCHAR(5000) NOT NULL,
    title VARCHAR(100) NOT NULL,
    PRIMARY KEY (ProblemId)
    );

CREATE TABLE problems.Attempt
(
	AttemptId INT NOT NULL AUTO_INCREMENT,
	username VARCHAR(50) NOT NULL,
	Problem INT NOT NULL,
	StartTime BIGINT, 
	EndTime BIGINT,
	Attempts INT,
	SourceCode VARCHAR(10000),
	FOREIGN KEY (Problem) references problem(ProblemId),
	PRIMARY KEY (AttemptId)
);

INSERT INTO problems.problem (description,test_case,expected_output,title)
Values('Write a program that outputs the string representation of numbers from 1 to n.  

But for multiples of three it should output Fizz instead of the number and for the multiples of five output Buzz. For numbers which are multiples of both three and five output FizzBuzz.

The input is a single integer n that must be read from stdin.', 15, '1
2
Fizz
4
Buzz
Fizz
7
8
Fizz
Buzz
11
Fizz
13
14
FizzBuzz
','FizzBuzz');

INSERT INTO problems.problem (description,test_case,expected_output,title)
Values('Given a list of integers, return indices of the two numbers such that they add up to a specific target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

The input for this problem consists of 3 lines. The first line contains an integer n representing the size of the input array.

The list of integers is given as a space-separated list on the second line line, and the target is given on the third.

The output should be 2 space-separated integers on the same line representing the indices of the numbers adding to the target.

Example Input:

4
2 7 11 15
9


Example Output:

0 1', '4
2 7 11 15
9','0 1', 'Sum Two');


