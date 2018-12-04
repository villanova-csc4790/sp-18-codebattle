DROP TABLE problems.Attempt;
DROP TABLE problems.TestCases;
DROP TABLE problems.problem;


CREATE TABLE problems.problem 
(
    ProblemId INT NOT NULL AUTO_INCREMENT,
    description VARCHAR(5000) NOT NULL,
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
	Attempts INT DEFAULT 0,
	Penalties INT DEFAULT 0,
	SourceCode VARCHAR(10000),
	FOREIGN KEY (Problem) references problem(ProblemId),
	PRIMARY KEY (AttemptId)
);

CREATE TABLE problems.TestCases
(
	CaseId INT NOT NULL AUTO_INCREMENT,
	ProblemId INT NOT NULL,
	Input VARCHAR(1000),
	expected_output VARCHAR (5000) NOT NULL,
	PRIMARY KEY (CaseId),
	FOREIGN KEY (ProblemId) References problem(ProblemId)
);

INSERT INTO problems.problem (description,title)
Values('Write a program that outputs the string representation of numbers from 1 to n.  

But for multiples of three it should output Fizz instead of the number and for the multiples of five output Buzz. For numbers which are multiples of both three and five output FizzBuzz.

The input is a single integer n that must be read from stdin.','FizzBuzz');

INSERT INTO problems.problem (description,title)
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

0 1','Sum Two');



INSERT INTO problems.TestCases(ProblemId,Input,expected_output)
Values(1,1, '1');

INSERT INTO problems.TestCases(ProblemId,Input,expected_output)
Values(1,15, '1
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
');

INSERT INTO problems.TestCases(ProblemId,Input,expected_output)
Values(1,30, '1
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
16
17
Fizz
19
Buzz
Fizz
22
23
Fizz
Buzz
26
Fizz
28
29
FizzBuzz
');

INSERT INTO problems.TestCases(ProblemId,Input,expected_output)
Values(1,10, '1
2
Fizz
4
Buzz
Fizz
7
8
Fizz
Buzz');

INSERT INTO problems.TestCases(ProblemId,Input,expected_output)
Values(1,18, '1
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
16
17
Fizz
');

INSERT INTO problems.TestCases(ProblemId,Input,expected_output)
Values(2,'4
2 7 11 15
9','0 1');

INSERT INTO problems.TestCases(ProblemId,Input,expected_output)
Values(2,'8
2 7 11 15 1 27 18 12 32
26','2 3');

INSERT INTO problems.TestCases(ProblemId,Input,expected_output)
Values(2,'4
2 7 11 15
17','0 3');

INSERT INTO problems.TestCases(ProblemId,Input,expected_output)
Values(2,'5
1 2 3 4 5
9','3 4');

INSERT INTO problems.TestCases(ProblemId,Input,expected_output)
Values(2,'7
7 31 23 15 12 3 18
22','0 3');

INSERT INTO problems.TestCases(ProblemId,Input,expected_output)
Values(2,'10
10 12 25 30 23 46 17 94 34 92
51','6 8');

INSERT INTO problems.TestCases(ProblemId,Input,expected_output)
Values(2,'2
7 11
18','0 1');




