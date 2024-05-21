const board = document.getElementById("board");

let squares = [...Array(8)].map(_ => Array(8));

for (let x = 7; x >= 0; x--) {
    let row = document.createElement("tr");
    board.appendChild(row);

    for (let y = 0; y < 8; y++) {
        let square = document.createElement("td");
        row.appendChild(square);

        squares[x][y] = square;
    }
}

function set_player_black() {
    squares = [...Array(8)].map((_, i) => [...Array(8)].map((_, j) => squares[7 - i][7 - j]));
}

function is_valid_offset(move) {
    const offset_0 = move.dst[0] - move.src[0];
    const offset_1 = move.dst[1] - move.src[1];

    if (offset_0 == 0 && offset_1 == 0) return false;

    switch (move.src[2].slice(0, 2)) {
        case "wp":
            return offset_0 == 1 && Math.abs(offset_1) <= 1 || offset_0 == 2 && offset_1 == 0 && move.src[0] == 1;
        case "bp":
            return offset_0 == -1 && Math.abs(offset_1) <= 1 || offset_0 == -2 && offset_1 == 0 && move.src[0] == 6;
        case "wn":
        case "bn":
            return Math.abs(offset_0) == 2 && Math.abs(offset_1) == 1 || Math.abs(offset_0) == 1 && Math.abs(offset_1) == 2;
        case "wb":
        case "bb":
            return Math.abs(offset_0) == Math.abs(offset_1);
        case "wr":
        case "br":
            return offset_0 == 0 || offset_1 == 0;
        case "wq":
        case "bq":
            return offset_0 == 0 || offset_1 == 0 || Math.abs(offset_0) == Math.abs(offset_1);
        case "wk":
        case "bk":
            return Math.abs(offset_0) <= 1 && Math.abs(offset_1) <= 1 || offset_0 == 0 && Math.abs(offset_1) == 2 || Math.abs(offset_0) == 2 && offset_1 == 0;
    }
}

let state;

function move_onclick(x1, y1, x, y) {
    
}

function update_square(square, square_state, x1, y1, update_imgs = true) {
    square.style.backgroundColor = "";

    if (state.last_move && (state.last_move.src[0] == x1 && state.last_move.src[1] == y1 || state.last_move.dst[0] == x1 && state.last_move.dst[1] == y1)) {
        square.style.backgroundColor = "rgba(0, 255, 255, 0.5)";
    }

    if (update_imgs) {
        if (square_state == null) {
            while (square.firstChild) square.removeChild(square.firstChild);

            square.className = "";
        } else {
            const img_class = "piece-" + square_state.slice(0, 2);

            if (square.className != img_class) {
                while (square.firstChild) square.removeChild(square.firstChild);

                const img = document.createElement("img");

                img.src = "https://images.chesscomfiles.com/chess-themes/pieces/marble/150/" + square_state.slice(0, 2) + ".png";

                square.appendChild(img);

                square.className = img_class;
            }
        }
    }

    if (square_state != null && square_state[0] == "wb"[player_id]) {
        square.onclick = () => {
            for (const row of squares) {
                for (const square2 of row) {
                    square2.style.backgroundColor = "";
                }
            }

            square.style.backgroundColor = "rgba(192, 0, 0, 0.6)";

            for (let x = 0; x < 8; x++) {
                for (let y = 0; y < 8; y++) {
                    const move = {
                        src: [x1, y1, state.board[x1][y1]],
                        dst: [x, y]
                    };
                
                    if (!is_valid_offset(move)) continue;
                
                    squares[x][y].onclick =  () => {
                        send_move(move);
                    };

                    // squares[x][y].style.backgroundColor = "rgba(255, 192, 192, 0.25)";
                }
            }

            square.onclick = () => {
                for (let x = 0; x < 8; x++) {
                    for (let y = 0; y < 8; y++) {
                        update_square(squares[x][y], state.board[x][y], x, y, false);
                    }
                }
            };
        };
    } else {
        square.onclick = null;
    }

    /*if (square_state != null) {
        square.onclick = () => {
            for (const row of squares) {
                for (const square2 of row) {
                    square2.style.backgroundColor = "";

                    square2.onclick = () => {
                        for (let x = 0; x < 8; x++) {
                            for (let y = 0; y < 8; y++) {
                                update_square(squares[x][y], state.board[x][y], x, y, false);
                            }
                        }
                    };
                }
            }

            square.style.backgroundColor = "rgba(128, 128, 128, 0.5)";

            square.onclick = () => {
                for (let x = 0; x < 8; x++) {
                    for (let y = 0; y < 8; y++) {
                        update_square(squares[x][y], state.squares[x][y], x, y, false);
                    }
                }
            };

            for (let move of square_state.moves) {
                squares[move[0]][move[1]].style.backgroundColor = state.squares[move[0]][move[1]] == null ? "rgba(0, 255, 0, 0.5)" : state.squares[move[0]][move[1]].piece.split(" ")[0] == square_state.piece.split(" ")[0] ? "rgba(0, 255, 255, 0.5)" : "rgba(255, 0, 0, 0.5)";

                squares[move[0]][move[1]].onclick = async () => {
                    const success = await (await fetch("http://localhost:8081/move?x1=" + x1 + "&y1=" + y1 + "&x2=" + move[0] + "&y2=" + move[1])).json();

                    if (!success) alert("success == false (inconsistency: is_valid_move != run_turn)");

                    await update_board_state("bs", !AI);

                    if (AI && state.win_state == "NO_WIN_STATE") update_board_state(AI);
                };
            }
        };
    } else {
        square.onclick = null;
    }*/
}

function update_board_state(json) {
    if (!json) return;

    state = JSON.parse(json);

    console.log(state);

    for (let x = 0; x < 8; x++) {
        for (let y = 0; y < 8; y++) {
            update_square(squares[x][y], state.board[x][y], x, y);
        }
    }
}

/*document.getElementById("reset").onclick = async () => {
    await fetch("http://localhost:8081/start");

    update_board_state(Math.random() < 1 / 2 ? "bs" : AI);
};*/