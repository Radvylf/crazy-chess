const ws = require('ws');

const server = new ws.WebSocketServer({
    port: 8007,
    host: "0.0.0.0"
});

function play_game(player_0, player_1) {
    let board_state = [
        ["wr0", "wn1", "wb2", "wq3", "wk4", "wb5", "wn6", "wr7"],
        ["wp8", "wp9", "wp10", "wp11", "wp12", "wp13", "wp14", "wp15"],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        ["bp16", "bp17", "bp18", "bp19", "bp20", "bp21", "bp22", "bp23"],
        ["br24", "bn25", "bb26", "bq27", "bk28", "bb29", "bn30", "br31"]
    ];

    let white_last_moved_piece = null;
    let black_last_moved_piece = null;

    function send_state(last_move = null) {
        player_0.send(JSON.stringify({
            board: board_state,
            last_move
        }));
        player_1.send(JSON.stringify({
            board: board_state,
            last_move
        }));
    }

    send_state();

    function play_move(player, move) {
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
    
        function is_blocked(move, board_state) {
            if (move.src[2][1] == "n") return [false];
    
            const offset_0 = move.dst[0] - move.src[0];
            const offset_1 = move.dst[1] - move.src[1];
    
            if (move.src[2][1] == "p") {
                if (offset_0 && offset_1) return [board_state[move.dst[0]][move.dst[1]] == null];
                if (Math.abs(offset_0) == 2) return [board_state[(move.src[0] + move.dst[0]) / 2][(move.src[1] + move.dst[1]) / 2] != null || board_state[move.dst[0]][move.dst[1]] != null];

                return [board_state[move.dst[0]][move.dst[1]] != null];
            }
    
            if (Math.abs(offset_0) <= 1 && Math.abs(offset_1) <= 1) return [false];
    
            if (move.src[2][1] == "k" && (Math.abs(offset_0) == 2 || Math.abs(offset_1) == 2)) {
                let d = 1;
    
                while (true) {
                    let d_0 = move.src[0] + offset_0 / 2 * d;
                    let d_1 = move.src[1] + offset_1 / 2 * d;
    
                    if (d_0 < 0 || d_0 >= 8 || d_1 < 0 || d_1 >= 8) return [true];
                    if (board_state[d_0][d_1] != null) return [!board_state[d_0][d_1].startsWith(move.src[2][0] + "r"), d_0, d_1];

                    d += 1;
                }
            }
    
            const dist = Math.abs(offset_0 || offset_1);
    
            for (let d = 1; d < dist; d++) {
                if (board_state[move.src[0] + offset_0 / dist * d][move.src[1] + offset_1 / dist * d] != null) return [true];
            }
    
            return [false];
        }

        if (!("src" in move) || !("dst" in move)) throw null;
        if (move.src.length != 3) throw null;
        if (typeof move.src[0] != "number" || !Number.isInteger(move.src[0]) || move.src[0] < 0 || move.src[0] >= 8) throw null;
        if (typeof move.src[1] != "number" || !Number.isInteger(move.src[1]) || move.src[1] < 0 || move.src[1] >= 8) throw null;
        if (typeof move.src[2] != "string") throw null;
        if ((move.src[2][0] == "w") != (player == 0)) throw null;
        if (move.dst.length != 2) throw null;
        if (typeof move.dst[0] != "number" || !Number.isInteger(move.dst[0]) || move.dst[0] < 0 || move.dst[0] >= 8) throw null;
        if (typeof move.dst[1] != "number" || !Number.isInteger(move.dst[1]) || move.dst[1] < 0 || move.dst[1] >= 8) throw null;
        if (!is_valid_offset(move)) throw null;

        const block = is_blocked(move, board_state);

        if (board_state[move.src[0]][move.src[1]] != move.src[2] || board_state[move.dst[0]][move.dst[1]] != null && board_state[move.dst[0]][move.dst[1]][0] == "wb"[player] || block[0] || [white_last_moved_piece, black_last_moved_piece][player] == move.src[2]) {
            [player_0, player_1][player].send("");
            
            return;
        }

        board_state[move.dst[0]][move.dst[1]] = move.src[2][1] == "p" && (move.dst[0] == 0 || move.dst[0] == 7) ? move.src[2][0] + "q" + move.src[2].slice(2) : move.src[2];
        board_state[move.src[0]][move.src[1]] = null;

        if (move.src[2][1] == "k" && 1 in block) {
            board_state[(move.src[0] + move.dst[0]) / 2][(move.src[1] + move.dst[1]) / 2] = board_state[block[1]][block[2]];
            if (block[1] != (move.src[0] + move.dst[0]) / 2 || block[2] != (move.src[1] + move.dst[1]) / 2) board_state[block[1]][block[2]] = null;
        }

        if (player == 0) {
            white_last_moved_piece = move.src[2];
        } else {
            black_last_moved_piece = move.src[2];
        }

        send_state(move);
    }

    setTimeout(() => {
        player_0.on("message", (msg) => {
            try {
                const data = JSON.parse(msg.toString());

                play_move(0, data);
            } catch (_) {
                player_0.close();
                player_1.close();
            }
        });
        player_1.on("message", (msg) => {
            try {
                const data = JSON.parse(msg.toString());

                play_move(1, data);
            } catch (_) {
                player_0.close();
                player_1.close();
            }
        });
    }, 3000);

    player_0.on("close", () => {
        player_1.close();
    });
    player_1.on("close", () => {
        player_0.close();
    });
}

const lobbies = new Map();

const ID_BYTE_SIZE = 4;

server.on("connection", (conn) => {
    var lobby_id_string = null;
    var player_id = null;

    conn.once("message", (msg) => {
        if (msg.length == 0) {
            const lobby_id = [...Array(ID_BYTE_SIZE)].map(_ => Math.random() * 256 | 0);

            lobby_id_string = lobby_id.map(b => b.toString(16).padStart(2, "0")).join("");
            player_id = 0;

            console.log("Player 0: " + lobby_id_string);

            lobbies.set(lobby_id_string, conn);

            conn.send(new Uint8Array(lobby_id));
        } else if (msg.length == ID_BYTE_SIZE) {
            lobby_id_string = [...msg].map(b => b.toString(16).padStart(2, "0")).join("");
            player_id = 1;

            const opp = lobbies.get(lobby_id_string);

            if (!opp) {
                console.log("Unknown lobby ID: " + lobby_id_string);

                conn.send(Buffer.alloc(0));
                conn.close();
            } else {
                console.log("Player 1 connected: " + lobby_id_string);

                lobbies.delete(lobby_id_string);

                play_game(opp, conn);
            }
        } else {
            console.log("Invalid first msg");

            conn.close();
        }
    });

    conn.on("close", () => {
        if (player_id == 0) {
            lobbies.delete(lobby_id_string);
        }

        console.log("close");
    });
});