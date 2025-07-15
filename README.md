# 0-1 Matrix Puzzle

The puzzle game in this app was created to illuminate an unsolved problem in group theory.
A matrix of zeros and ones is displayed, and the player is challenged to transform it into
the identity matrix in the least number of moves. A move consists of selecting two rows,
and then adding the first row to the second row, modulo 2. This move is called a *transvection*.

The player makes a move by selecting two rows of the matrix. A row is selected by clicking on the
row label on the left side of the matrix. The row labels are R1, R2, R3, etc. The history
panel shows the sequence of moves made by the player. The controls allow the player to
change the order of the matrix, undo the previous move, reset the matrix to the initial state,
or randomize the matrix.

It is known that any invertible matrix over F<sub>2</sub>
(the field with two elements) can be transformed into the identity matrix
by a sequence of transvections, but the minimum number of moves required is not known.
If the initial matrix is a cyclic permutation matrix of order n, it is *conjectured* that
the minimum number of moves required is 3n &minus; 3. This conjecture has been verified
up to n = 8, but remains unproven.

Your contributions to this project are welcome.

- David Radcliffe