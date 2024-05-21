var player_id = null;

function send_move() {}

function start_ws(lobby_id) {
    const ws = new WebSocket("wss://" + window.location.host + "/crazy-chess/ws");

    ws.binaryType = "arraybuffer";

    player_id = lobby_id ? 1 : 0;
    var pairing_status = 0;

    ws.onopen = () => {
        console.log("open");

        ws.send(lobby_id ? new Uint8Array(lobby_id.match(/../g).map(x => parseInt(x, 16))) : new Uint8Array(0));
    };

    ws.onmessage = (event) => {
        console.log("message", event.data);

        if (player_id == 0 && pairing_status == 0) {
            show_lobby_id([...new Uint8Array(event.data)].map(x => x.toString(16).padStart(2, "0")).join(""));

            pairing_status = 1;
        } else if (player_id == 1 && pairing_status == 0) {
            if (typeof event.data == "string") {
                start_game();
                set_player_black();
                update_board_state(event.data);

                send_move = (move) => ws.send(JSON.stringify(move));

                pairing_status = 2;
            } else {
                lobby_id_not_found();
            }
        } else if (player_id == 0 && pairing_status == 1) {
            start_game();
            update_board_state(event.data);

            send_move = (move) => ws.send(JSON.stringify(move));

            pairing_status = 2;
        } else {
            update_board_state(event.data);
        }
    };

    ws.onclose = () => {
        console.log("close");

        send_move = () => {};
    };
}